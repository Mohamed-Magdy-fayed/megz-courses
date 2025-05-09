import ProductActions from "@/components/admin/systemManagement/products/ProductActions";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { Checkbox } from "@/components/ui/checkbox";
import { filterFn, formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

export type ProductColumn = {
    id: string;
    isActive: "Active" | "Inactive";
    description: string | null;
    name: string;
    privatePrice: number;
    groupPrice: number;
    orders: { id: string; }[];
    amounts: number;
    createdAt: Date;
    updatedAt: Date;
}

export const productColumns: ColumnDef<ProductColumn>[] = [
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
    { accessorKey: "name", cell: ({ row }) => <Link className="in-table-link" href={`/admin/system_management/products/${row.original.id}`}>{row.original.name}</Link> },
    { accessorKey: "isActive", cell: ({ row }) => <SeverityPill color={row.original.isActive === "Active" ? "success" : "destructive"} children={row.original.isActive} /> },
    { accessorKey: "privatePrice", cell: ({ row }) => formatPrice(row.original.privatePrice), filterFn },
    { accessorKey: "groupPrice", cell: ({ row }) => formatPrice(row.original.groupPrice), filterFn },
    { accessorKey: "amounts", cell: ({ row }) => `${row.original.orders.length} Orders` },
    { accessorKey: "updatedAt", cell: ({ row }) => format(row.original.updatedAt, "PPp"), filterFn },
    { accessorKey: "createdAt", cell: ({ row }) => format(row.original.createdAt, "PPp"), filterFn },
    { id: "actions", header: "Actions", cell: ({ row }) => <ProductActions {...row.original} /> },
]