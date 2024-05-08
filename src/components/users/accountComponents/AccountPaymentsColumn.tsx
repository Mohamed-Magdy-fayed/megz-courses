import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import { OrderStatus } from "@prisma/client";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import AccountPaymentActionCell from "./AccountPaymentActionCell";

export type Order = {
    id: string,
    amount: number,
    orderNumber: string,
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<Order>[] = [
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
        accessorKey: "orderNumber",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Order Number
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
            <Link className="block w-fit" href={`/orders/${row.original.id}`}>
                <div className="flex flex-col gap-2">
                    <Typography
                        className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                    >
                        {row.original.orderNumber}
                    </Typography>
                </div>
            </Link>
        ),
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Amount
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
            <Typography>
                {formatPrice(row.original.amount)}
            </Typography>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Status
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
            const status = row.original.status
            const color: SeverityPillProps["color"] =
                status === "cancelled" ? "destructive"
                    : status === "done" ? "success"
                        : status === "paid" ? "info"
                            : status === "pending" ? "muted" : "destructive"
            return (
                <SeverityPill color={color}>
                    {status}
                </SeverityPill>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created on",
        cell: ({ row }) => {
            return (
                <>
                    {format(row.original.createdAt, "do MMM yy")}
                </>
            )
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Paid on",
        cell: ({ row }) => {
            return (
                <>
                    {format(row.original.updatedAt, "do MMM yy")}
                </>
            )
        }
    },
    {
        id: "action",
        header: "Actions",
        cell: ({ row }) => (
            <AccountPaymentActionCell id={row.original.id} />
        ),
    },
];
