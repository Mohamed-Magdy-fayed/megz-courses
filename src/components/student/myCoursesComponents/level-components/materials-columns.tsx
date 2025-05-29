import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { SessionStatus } from "@prisma/client";

import { validSessionStatusesColors } from "@/lib/enumColors";
import { Typography } from "@/components/ui/Typoghraphy";
import { SeverityPill } from "@/components/ui/SeverityPill";
import MaterialActions from "@/components/student/myCoursesComponents/level-components/materials-actions";

// Types for each session row
export type MaterialColumn = {
    id: string;
    title: string;
    sessionStatus: SessionStatus;
    teacherName: string;
    sessionLink?: string;
    assignmentLink?: string;
    quizLink?: string;
    assignmentScore?: number | null;
    quizScore?: number | null;
    contentLinks: string[];
    finalTestLink?: string;
    finalTestScore?: number | null;
    finalTestSubmitted?: boolean;
    certificateUrl?: string | null;
};

export const sessionColumns: ColumnDef<MaterialColumn>[] = [
    {
        accessorKey: "title",
        header: "Session",
        cell: ({ row }) =>
            row.original.sessionLink ? (
                <Link className="in-table-link" href={row.original.sessionLink}>
                    <Typography>{row.original.title}</Typography>
                </Link>
            ) : (
                <Typography>{row.original.title}</Typography>
            ),
    },
    {
        accessorKey: "sessionStatus",
        header: "Session Status",
        cell: ({ row }) => (
            <SeverityPill color={validSessionStatusesColors(row.original.sessionStatus)}>
                {row.original.sessionStatus}
            </SeverityPill>
        ),
    },
    {
        accessorKey: "teacherName",
        header: "Teacher",
        cell: ({ row }) => <Typography>{row.original.teacherName}</Typography>,
    },
    {
        accessorKey: "assignmentScore",
        header: "Assignment Score",
        cell: ({ row }) =>
            row.original.assignmentScore !== null && row.original.assignmentScore !== undefined
                ? <Typography>{row.original.assignmentScore || row.original.finalTestScore}</Typography>
                : <Typography>-</Typography>,
    },
    {
        accessorKey: "quizScore",
        header: "Quiz Score",
        cell: ({ row }) =>
            row.original.quizScore !== null && row.original.quizScore !== undefined
                ? <Typography>{row.original.quizScore}</Typography>
                : <Typography>-</Typography>,
    },
    {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => <MaterialActions material={row.original} />,
        enableSorting: false,
    },
];