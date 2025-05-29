import { GroupStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { formatPercentage } from "@/lib/utils";
import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { validGroupStatusColors } from "@/lib/enumColors";
import LevelActions from "@/components/student/myCoursesComponents/course-components/levels-actions";

// Types for each level row
export type LevelColumn = {
    id: string;
    courseSlug: string;
    levelSlug: string;
    groupId: string;
    groupStatus: GroupStatus;
    name: string;
    progress: number;
    attendance: number;
    missedSessions: string;
    avgAssignmentScore: string;
    avgQuizScore: string;
    finalTestScore?: number;
    certificateUrl?: string;
    teacherName: string;
    groupType: "Private" | "Group";
};

export const levelColumns: ColumnDef<LevelColumn>[] = [
    {
        enableSorting: false,
        accessorKey: "name",
        header: "Level",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/student/my_courses/${row.original.courseSlug}/${row.original.levelSlug}`}>
                <Typography>{row.original.name}</Typography>
            </Link>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "groupStatus",
        header: "Group Status",
        cell: ({ row }) => (
            <SeverityPill color={validGroupStatusColors(row.original.groupStatus)}>{row.original.groupStatus}</SeverityPill>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "groupType",
        header: "Group Type",
        cell: ({ row }) => (
            <Typography>{row.original.groupType}</Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => (
            <Typography>{formatPercentage(row.original.progress)}</Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "attendance",
        header: "Attendance",
        cell: ({ row }) => (
            <Typography>{formatPercentage(row.original.attendance)}</Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "missedSessions",
        header: "Missed Sessions",
        cell: ({ row }) => (
            <Typography>{row.original.missedSessions}</Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "avgAssignmentScore",
        header: "Avg Assignment",
        cell: ({ row }) => (
            <Typography>{row.original.avgAssignmentScore ?? "-"}</Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "avgQuizScore",
        header: "Avg Quiz",
        cell: ({ row }) => (
            <Typography>{row.original.avgQuizScore ?? "-"}</Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "finalTestScore",
        header: "Final Test",
        cell: ({ row }) => (
            <Typography>
                {row.original.finalTestScore !== undefined
                    ? formatPercentage(row.original.finalTestScore)
                    : "-"}
            </Typography>
        ),
    },
    {
        enableSorting: false,
        accessorKey: "teacherName",
        header: "Teacher",
        cell: ({ row }) => (
            <Typography>{row.original.teacherName}</Typography>
        ),
    },
    {
        enableSorting: false,
        id: "actions",
        header: "Actions",
        cell: ({ row }) => !!row.original.groupId && (
            <LevelActions {...row.original} />
        ),
    },
];