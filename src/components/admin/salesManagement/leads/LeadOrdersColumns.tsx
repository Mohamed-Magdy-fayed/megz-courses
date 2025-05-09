import LeadOrderActions from "@/components/admin/salesManagement/leads/LeadOrderActions";
import TransactionsModal from "@/components/admin/salesManagement/modals/TransactionsModal";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { Checkbox } from "@/components/ui/checkbox";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { validOrderStatusesColors } from "@/lib/enumColors";
import { filterFn, formatPrice } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

export type LeadOrderColumn = {
    id: string;
    amount: number;
    orderNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    remainingAmount: number;
    paidAmount: number;
    status: OrderStatus;
    refundRequester: string | null;
    productId: string;
    productName: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const leadOrderColumns: ColumnDef<LeadOrderColumn>[] = [
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
    { accessorKey: "orderNumber", cell: ({ row }) => <Link className="in-table-link" href={`/admin/sales_management/orders/${row.original.orderNumber}`}>{row.original.orderNumber}</Link> },
    { accessorKey: "amount", cell: ({ row }) => formatPrice(row.original.amount) },
    {
        accessorKey: "status", cell: ({ row }) => {
            return (
                <WrapWithTooltip text={row.original.status === "Refunded" ? `Refunded By: ${row.original.refundRequester ? row.original.refundRequester : format(row.original.updatedAt, "PPP")}` : ""}>
                    <SeverityPill color={validOrderStatusesColors(row.original.status)}>
                        {row.original.status}
                    </SeverityPill>
                </WrapWithTooltip>
            )
        },
    },
    { accessorKey: "paidAmount", header: "Transactions", cell: ({ row }) => <TransactionsModal orderId={row.original.id} remainingAmount={row.original.remainingAmount} /> },
    { accessorKey: "paidAt", filterFn, cell: ({ row }) => row.original.paidAt ? format(row.original.paidAt, "PPp") : "No payments" },
    { accessorKey: "productId", cell: ({ row }) => <Link className="in-table-link" href={`/admin/system_management/products/${row.original.productId}`}>{row.original.productName}</Link> },
    { id: "action", header: "Actions", cell: ({ row }) => <LeadOrderActions {...row.original} /> },
]