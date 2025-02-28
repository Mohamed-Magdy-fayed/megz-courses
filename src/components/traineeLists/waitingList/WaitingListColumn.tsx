import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { filterFn } from "@/lib/dataTableUtils";

export type FullWaitingListRow = {
    id: string,
    name: string,
    levelSlugs: {
        value: string;
        label: string;
    }[],
    levelSlug: string,
    levelName: string,
    image: string | null,
    email: string,
    isPrivate: "Group" | "Private",
    phone: string | null,
    courseId: string,
    courseName: string,
    courseSlug: string,
    createdAt: Date,
    updatedAt: Date,
};

export const traineeColumns: ColumnDef<FullWaitingListRow>[] = [
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
        accessorKey: "name",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/admin/users_management/account/${row.original.id}`}>
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "courseSlug",
        header: "Course Name",
        cell: ({ row }) => {
            return (
                <Link className="in-table-link" href={`/admin/system_management/content/courses/${row.original.courseSlug}`}>
                    {row.original.courseName}
                </Link>
            )
        },
    },
    {
        accessorKey: "levelSlug",
        header: "Level",
        cell: ({ row }) => (
            <Typography>{row.original.levelName}</Typography>
        )
    },
    {
        accessorKey: "isPrivate",
        header: "Is Private",
        cell: ({ row }) => (
            <Typography>{row.original.isPrivate}</Typography>
        )
    },
    {
        accessorKey: "updatedAt",
        cell: ({ row }) => {
            return (
                <>{format(row.original.updatedAt, "PP")}</>
            )
        },
        filterFn,
    },
];
