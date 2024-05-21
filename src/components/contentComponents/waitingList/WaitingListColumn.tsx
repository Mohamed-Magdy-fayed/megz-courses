import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { Devices, Order } from "@prisma/client";
import WaitingListActionCell from "./WaitingListActionCell";

export type WaitingList = {
    id: string,
    name: string,
    image: string | null,
    device: Devices | null,
    email: string,
    phone: string | null,
    orders: Order[] | null,
    courseId: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<WaitingList>[] = [
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
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Info
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => (
            <Link className="block w-fit" href={`/account/${row.original.id}`}>
                <div className="flex items-center gap-2" >
                    <img alt={row.original.name} src={row.original.image!} className="max-h-12" />
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.name}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500 whitespace-normal truncate max-h-14">
                            {row.original.email}
                        </Typography>
                    </div>
                </div>
            </Link>
        ),
    },
    {
        accessorKey: "orders",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Ordered on
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            return (
                <>{format(row.original.orders?.find(order => order.courseIds.some(id => id === row.original.courseId))?.createdAt || new Date(), "dd MMM yyyy")}</>
            )
        }
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <WaitingListActionCell
            id={row.original.id}
        />,
    },
];
