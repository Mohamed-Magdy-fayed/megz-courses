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
import { formatPercentage } from "@/lib/utils";
import { CourseLevels } from "@prisma/client";

export type Column = {
    id: string,
    isLevelSubmitted: boolean,
    isLevelSubmittedString: "Completed" | "Waiting",
    level: CourseLevels | undefined,
    courseId: string,
    courseLevels: CourseLevels[],
    testLink: string,
    studentUserId: string,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    studentImage: string,
    testTime: string,
    isWrittenTestDone?: boolean,
    writtenTestResult?: number,
    writtenTestTotalPoints?: number,
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
            const isOralTestTimePassed = (new Date(row.original.testTime).getDay() || 32) < new Date().getDay()

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
                    <Typography>{row.original.testTime}</Typography>
                    <Button disabled={isOralTestTimePassed}>Join Meeting</Button>
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
