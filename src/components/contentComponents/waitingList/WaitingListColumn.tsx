import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { Devices, Order } from "@prisma/client";
import { getInitials } from "@/lib/getInitials";

export type WaitingListRow = {
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
    orders: Order[] | null,
    courseId: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<WaitingListRow>[] = [
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
        accessorKey: "email",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/account/${row.original.id}`}>
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "orders",
        header: "Ordered on",
        cell: ({ row }) => {
            return (
                <>{format(row.original.orders?.find(order => order.courseId === row.original.courseId)?.createdAt || new Date(), "dd MMM yyyy")}</>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.orders?.find(order => order.courseId === row.original.courseId)?.createdAt
            if (!val) return true
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
    },
    {
        accessorKey: "levelSlug",
        header: "Level",
        cell: ({ row }) => (
            <Typography>{row.original.levelName}</Typography>
        )
    },
];
