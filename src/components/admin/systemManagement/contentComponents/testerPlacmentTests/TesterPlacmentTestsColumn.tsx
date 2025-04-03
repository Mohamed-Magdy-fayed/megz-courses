import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./TesterPlacmentTestsActionCell";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { SeverityPill, SeverityPillProps } from "@/components/ui/SeverityPill";
import { cn, formatPercentage, isTimeNow, isTimePassed } from "@/lib/utils";
import { CourseLevel } from "@prisma/client";
import { format } from "date-fns";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import SelectField from "@/components/ui/SelectField";
import { DatePicker } from "@/components/ui/DatePicker";
import { Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";

export type Column = {
    id: string,
    isLevelSubmitted: boolean,
    isLevelSubmittedString: "Completed" | "Waiting",
    level: string | undefined,
    courseId: string,
    courseName: string,
    courseLevels: CourseLevel[],
    testLink: string,
    oralTestLink: string | undefined,
    testersData: {
        id: string;
        name: string;
    }[],
    studentUserId: string,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    studentImage: string,
    testTime: Date,
    isWrittenTestDone?: "true" | "false",
    writtenTestResult?: number,
    writtenTestTotalPoints?: number,
    oralTestQuestions: string | null,
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
            <Link className="block w-fit" href={`/admin/users_management/account/${row.original.studentUserId}`}>
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
        accessorKey: "courseName",
        header: "Course",
        cell: ({ row }) => (
            <Typography>{row.original.courseName}</Typography>
        )
    },
    {
        accessorKey: "isWrittenTestDone",
        cell: ({ row }) => {
            const color: SeverityPillProps["color"] = row.original.isWrittenTestDone === "true" ? "success" : "destructive"
            const testResultPercentage = row.original.writtenTestResult && row.original.writtenTestTotalPoints && formatPercentage(row.original.writtenTestResult / row.original.writtenTestTotalPoints * 100)
            return (
                <SeverityPill color={color}>
                    {row.original.isWrittenTestDone === "true" ? `Done ${testResultPercentage}` : "Not Completed"}
                </SeverityPill>
            )
        }
    },
    {
        accessorKey: "isLevelSubmittedString",
        cell: ({ row }) => {
            const color: SeverityPillProps["color"] = row.original.isLevelSubmittedString === "Completed" ? "success" : "destructive"
            const testResult = row.original.level
            return (
                <SeverityPill color={color}>
                    {row.original.isLevelSubmittedString === "Completed" ? `${testResult}` : "Not Completed"}
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
            const isOralTestTimeNow = isTimeNow(currentTestTime)

            const { toastError, toast } = useToast()

            const trpcUtils = api.useUtils()
            const createPlacementTestMeetingMutation = api.placementTests.schedulePlacementTestWithNoLead.useMutation(
                createMutationOptions({
                    trpcUtils,
                    toast,
                    loadingToast,
                    setLoadingToast,
                    successMessageFormatter: ({ oldTest }) => {
                        setIsOpen(false)
                        return oldTest ? "Placement Test Rescheduled Successfully" : "Placement Test Created Successfully"
                    }
                })
            )

            const handleSchedulePlacementTest = () => {
                if (!trainerId[0] || !testTime) return toastError("Missing some information here!")
                createPlacementTestMeetingMutation.mutate({
                    testTime,
                    courseId: row.original.courseId,
                    userId: row.original.studentUserId,
                    testerId: trainerId[0],
                })
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
                                        row.original.testersData.map(({ id, name }) => ({
                                            Active: true,
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
                                    <Button disabled={!!loadingToast} onClick={() => handleSchedulePlacementTest()}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                    <Typography>{format(row.original.testTime, "PPPp")}</Typography>
                    {row.original.isLevelSubmitted ? null :
                        isOralTestTimePassed ? (
                            <Button onClick={() => setIsOpen(true)}>Reschedule</Button>
                        ) : isOralTestTimeNow ? (
                            <Link target="_blank" className={cn("w-fit", !row.original.oralTestLink && "pointer-events-none")} href={row.original.oralTestLink || ""}>
                                <Button disabled={isOralTestTimePassed || !row.original.oralTestLink}>Join Meeting</Button>
                            </Link>
                        ) : null}
                </div>
            )
        }
    },
    {
        accessorKey: "createdBy",
    },
    {
        accessorKey: "createdAt",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            isLevelSubmitted={row.original.isLevelSubmitted}
            levelName={row.original.level || ""}
            testLink={row.original.testLink}
            userId={row.original.studentUserId}
            courseId={row.original.courseId}
            courseName={row.original.courseName}
            courseLevels={row.original.courseLevels}
            oralTestQuestions={row.original.oralTestQuestions}
        />,
    },
];
