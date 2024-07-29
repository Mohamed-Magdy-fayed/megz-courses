import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./TesterPlacmentTestsActionCell";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import { formatPercentage, isTimePassed } from "@/lib/utils";
import { CourseLevel, Meeting } from "@prisma/client";
import { format } from "date-fns";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import SelectField from "@/components/salesOperation/SelectField";
import { DatePicker } from "@/components/ui/DatePicker";
import { Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { toastType, useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { env } from "@/env.mjs";

export type Column = {
    id: string,
    isLevelSubmitted: boolean,
    isLevelSubmittedString: "Completed" | "Waiting",
    level: string | undefined,
    courseId: string,
    courseLevels: CourseLevel[],
    testLink: string,
    trainersData: {
        id: string;
        name: string;
    }[],
    studentUserId: string,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    studentImage: string,
    testTime: Date,
    isWrittenTestDone?: boolean,
    writtenTestResult?: number,
    writtenTestTotalPoints?: number,
    oralTestMeeting: Meeting,
    createdBy: string,
    createdAt: string,
    updatedAt: string,
};

export const columns: ColumnDef<Column>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "studentName",
        header: "Student Info",
        cell: ({ row }) => (
            <Link className="block w-fit" href={`/account/${row.original.studentUserId}`}>
                <div className="flex items-center gap-2" >
                    <Avatar>
                        <AvatarImage src={`${row.original.studentImage}`} />
                        <AvatarFallback>
                            {getInitials(`${row.original.studentName}`)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.studentName}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                            {row.original.studentEmail}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                            {row.original.studentPhone}
                        </Typography>
                    </div>
                </div>
            </Link>
        )
    },
    {
        accessorKey: "isWrittenTestDone",
        header: "Written Test Status",
        cell: ({ row }) => {
            const color: SeverityPillProps["color"] = row.original.isWrittenTestDone ? "success" : "destructive"
            const testResultPercentage = row.original.writtenTestResult && row.original.writtenTestTotalPoints && formatPercentage(row.original.writtenTestResult / row.original.writtenTestTotalPoints * 100)
            return (
                <SeverityPill color={color}>
                    {row.original.isWrittenTestDone ? `Done ${testResultPercentage}` : "Not completed"}
                </SeverityPill>
            )
        }
    },
    {
        accessorKey: "testTime",
        header: "Oral Test Time",
        cell: ({ row }) => {
            const [isOpen, setIsOpen] = useState(false)
            const [trainerId, setTrainerId] = useState<string[]>([])
            const [testTime, setTestTime] = useState<Date | undefined>(new Date())
            const [loadingToast, setLoadingToast] = useState<toastType>()


            const currentTestTime = new Date(row.original.testTime).getTime();

            const isOralTestTimePassed = isTimePassed(currentTestTime)

            const { toastError, toast } = useToast()

            const trpcUtils = api.useContext()
            const createPlacementTestMeetingMutation = api.zoomMeetings.createPlacementTestMeeting.useMutation()
            const editPlacementTestMutation = api.placementTests.editPlacementTest.useMutation()
            const availableZoomClientMutation = api.zoomAccounts.getAvailableZoomClient.useMutation({
                onMutate: () => {
                    setLoadingToast(toast({
                        title: "Loading...",
                        variant: "info",
                        description: (
                            <Spinner className="h-4 w-4" />
                        ),
                        duration: 30000,
                    }))
                },
                onSuccess: ({ zoomClient }) => {
                    if (!zoomClient?.id) return loadingToast?.update({
                        id: loadingToast.id,
                        title: "Error",
                        description: "No available Zoom Accounts at the selected time!",
                        duration: 2000,
                        variant: "destructive",
                    })
                    refreshTokenMutation.mutate({ zoomClientId: zoomClient.id }, {
                        onSuccess: ({ updatedZoomClient }) => {
                            if (!trainerId[0] || !testTime) return loadingToast?.update({
                                id: loadingToast.id,
                                title: "Error",
                                description: "Missing some information here!",
                                duration: 2000,
                                variant: "destructive",
                            })
                            createPlacementTestMeetingMutation.mutate({
                                zoomClientId: updatedZoomClient.id,
                                courseId: row.original.courseId,
                                testTime,
                                trainerId: trainerId[0],
                            }, {
                                onSuccess: ({ meetingNumber, meetingPassword, meetingLink }) => {
                                    sendWhatsAppMessage({
                                        toNumber: "201123862218",
                                        textBody: `Hi ${row.original.studentName},
                                        \nyour oral placement test is scheduled at ${format(testTime, "PPPPp")} with Mr. ${row.original.trainersData.find(trainer => trainer.id === trainerId[0])?.name}
                                        \nPlease access it on time through this link: ${meetingLink}`,
                                    })
                                    editPlacementTestMutation.mutate({
                                        testId: row.original.id,
                                        testTime,
                                        trainerId: trainerId[0]!,
                                        meetingNumber,
                                        meetingPassword,
                                    }, {
                                        onSuccess: () => {
                                            trpcUtils.invalidate()
                                                .then(() => {
                                                    setIsOpen(false)
                                                    loadingToast?.update({
                                                        id: loadingToast.id,
                                                        title: "Success",
                                                        description: "New time scheduled successfully",
                                                        duration: 2000,
                                                        variant: "success",
                                                    })
                                                })
                                        },
                                        onError: ({ message }) => {
                                            loadingToast?.update({
                                                id: loadingToast.id,
                                                title: "Error",
                                                description: message,
                                                duration: 2000,
                                                variant: "destructive",
                                            })
                                        },
                                    })
                                },
                                onError: ({ message }) => {
                                    loadingToast?.update({
                                        id: loadingToast.id,
                                        title: "Error",
                                        description: message,
                                        duration: 2000,
                                        variant: "destructive",
                                    })
                                },
                            })
                        },
                    })
                },
            });
            const refreshTokenMutation = api.zoomMeetings.refreshToken.useMutation();

            const handleSchedulePlacementTest = () => {
                if (!trainerId[0] || !testTime) return toastError("Missing some information here!")
                availableZoomClientMutation.mutate({ startDate: testTime })
            }

            if (row.original.isLevelSubmitted) {
                const level = row.original.level
                const color: SeverityPillProps["color"] =
                    level === "A0_A1_Beginner_Elementary" || level === "A2_Pre_Intermediate" ? "info"
                        : level === "B1_Intermediate" || level === "B2_Upper_Intermediate" ? "success"
                            : "destructive"
                return (
                    <SeverityPill className="max-w-fit p-2" color={color}>{level}</SeverityPill>
                )
            }

            return (
                <div className="flex flex-col gap-2">
                    <Modal
                        title="Reschedule"
                        description="Reschedule a placement test"
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        children={(
                            <div className="space-y-4">
                                <SelectField
                                    data={
                                        row.original.trainersData.map(({ id, name }) => ({
                                            active: true,
                                            label: name,
                                            value: id,
                                        }))
                                    }
                                    listTitle="Testers"
                                    placeholder="Select Tester"
                                    setValues={setTrainerId}
                                    values={trainerId}
                                />
                                <DatePicker
                                    date={testTime}
                                    setDate={setTestTime}
                                />
                                <div>
                                    <Button onClick={() => handleSchedulePlacementTest()}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                    <Typography>{format(row.original.testTime, "PPPp")}</Typography>
                    {isOralTestTimePassed ? (
                        <Button onClick={() => setIsOpen(true)}>Reschedule</Button>
                    ) : (
                        <Link target="_blank" className="w-fit" href={`/meeting/?mn=${row.original.oralTestMeeting.meetingNumber}&pwd=${row.original.oralTestMeeting.meetingPassword}&session_title=Placement_Test&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}staff/my_tasks`}>
                            <Button disabled={isOralTestTimePassed}>Join Meeting</Button>
                        </Link>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "createdBy",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Sales Agent
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Created at
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "isLevelSubmittedString",
        header: "",
        cell: "",
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            isLevelSubmitted={row.original.isLevelSubmitted}
            testLink={row.original.testLink}
            userId={row.original.studentUserId}
            courseId={row.original.courseId}
            courseLevels={row.original.courseLevels}
        />,
    },
];
