import { SeverityPill } from "@/components/overview/SeverityPill";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import { validSupportTicketStatusColors } from "@/lib/enumColors";
import { filterFn } from "@/lib/utils";
import { SupportTicketStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
//Template
export type TicketsColumnsType = {
    id: string;
    subject: string;
    info: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
    createdByName: string;
    createdByEmail: string;
    createdByPhone: string | null;
    status: SupportTicketStatus;
    messagesCount: number;
}

export const ticketsColumns: ColumnDef<TicketsColumnsType>[] = [
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
        enableHiding: false
    },
    { accessorKey: "subject", cell: ({ row }) => <Link href={`/tickets/${row.original.id}`}>{row.original.subject}</Link> },
    { accessorKey: "info", cell: ({ row }) => <Typography variant={"bodyText"} className="max-w-xs whitespace-pre-line">{row.original.info}</Typography> },
    { accessorKey: "status", cell: ({ row }) => <SeverityPill color={validSupportTicketStatusColors(row.original.status)}>{row.original.status}</SeverityPill> },
    { accessorKey: "messagesCount", cell: ({ row }) => `${row.original.messagesCount} Messages` },
    {
        accessorKey: "createdByName", cell: ({ row }) => (
            <Link href={`/account/${row.original.createdById}`}>
                <div className="flex flex-col gap-2">
                    <Typography>{row.original.createdByName}</Typography>
                    <Typography>{row.original.createdByEmail}</Typography>
                    <Typography>{row.original.createdByPhone}</Typography>
                </div>
            </Link>
        )
    },
    { accessorKey: "updatedAt", cell: ({ row }) => format(row.original.updatedAt, "PPPp"), filterFn },
    { accessorKey: "createdAt", cell: ({ row }) => format(row.original.createdAt, "PPPp"), filterFn },
]