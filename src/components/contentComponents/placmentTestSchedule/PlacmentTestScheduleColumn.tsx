import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./PlacmentTestScheduleActionCell";
import { getInitials } from "@/lib/getInitials";
import { format } from "date-fns";
import { Meeting } from "@prisma/client";

export type PlacmentTestScheduleRow = {
    id: string;
    isLevelSubmitted: boolean,
    courseId: string,
    courseName: string,
    courseLevels: { label: string, value: string }[],
    testLink: string,
    studentUserId: string;
    studentName: string;
    studentEmail: string;
    studentImage: string | null;
    oralTestTime: Date;
    oralTestMeeting: Meeting;
    oralTestQuestions: string | null;
    testerId: string;
    testerName: string;
    testerEmail: string;
    testerImage: string | null;
    rating: string;
    link: string;
    createdAt: Date;
    updatedAt: Date;
};

export const columns: ColumnDef<PlacmentTestScheduleRow>[] = [
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
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/account/${row.original.studentUserId}`}>
                {row.original.studentName}
            </Link>
        ),
    },
    {
        accessorKey: "testerName",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/account/${row.original.testerId}`}>
                {row.original.testerName}
            </Link>
        ),
    },
    {
        accessorKey: "oralTestTime",
        cell: ({ row }) => (
            <Typography>{format(row.original.oralTestTime, "PPPp")}</Typography>
        ),
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.createdAt
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
    },
    {
        accessorKey: "rating",
        header: "Rating",
    },
    {
        accessorKey: "createdAt",
        header: "Created On",
        cell: ({ row }) => (
            <Typography>{format(row.original.createdAt, "Pp")}</Typography>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            courseName={row.original.courseName}
            oralTestQuestions={row.original.oralTestQuestions}
            isLevelSubmitted={row.original.isLevelSubmitted}
            testLink={row.original.testLink}
            userId={row.original.studentUserId}
            courseId={row.original.courseId}
            courseLevels={row.original.courseLevels}
            oralTestMeeting={row.original.oralTestMeeting}
        />,
    },
];
