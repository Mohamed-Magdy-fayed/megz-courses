import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { Devices, Order } from "@prisma/client";

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
    device: Devices | null,
    email: string,
    phone: string | null,
    orderDate: Date,
    courseName: string,
    courseSlug: string,
    courseId: string,
    isPrivate: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<FullWaitingListRow>[] = [
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
        accessorKey: "courseName",
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
        accessorKey: "orderDate",
        cell: ({ row }) => {
            return (
                <>{format(row.original.orderDate, "PP")}</>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.orderDate
            if (!val) return true
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
    },
];
