import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { GroupStatus } from "@prisma/client";
import CourseGroupsActionCell from "./CourseGroupsActionCell";
import { SeverityPill, SeverityPillProps } from "@/components/ui/SeverityPill";

export type CourseRow = {
    id: string;
    groupNumber: string;
    groupStatus: GroupStatus;
    startDate: Date;
    levelSlugs: {
        value: string;
        label: string;
    }[],
    levelSlug: string,
    levelName: string,
    studentIds: string[];
    teacherId: string;
    courseId: string,
    courseLevel: {
        id: string;
        name: string;
        slug: string;
    },
    createdAt: Date;
    updatedAt: Date;
}

export const columns: ColumnDef<CourseRow>[] = [
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
        accessorKey: "groupNumber",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/admin/operations_management/groups/${row.original.id}`}>
                {row.original.groupNumber}
            </Link>
        )
    },
    {
        accessorKey: "startDate",
        cell: ({ row }) => {
            return (
                <>{format(row.original.startDate, "dd MMM yyyy")}</>
            )
        }
    },
    {
        accessorKey: "groupStatus",
        cell: ({ row }) => {
            const status = row.original.groupStatus
            const color: SeverityPillProps["color"] =
                status === "Completed" ? "success"
                    : status === "Cancelled" ? "destructive"
                        : status === "Inactive" ? "secondary"
                            : status === "Active" ? "info"
                                : status === "Paused" ? "muted" : "primary"

            return <SeverityPill color={color}>{status}</SeverityPill>
        },
        enableSorting: true
    },
    {
        accessorKey: "levelSlug",
        cell: ({ row }) => (
            <Typography>{row.original.levelName}</Typography>
        ),
    },
    {
        id: "actions",
        header: "Actoins",
        cell: ({ row }) => <CourseGroupsActionCell
            {...row.original}
        />,
    },
];
