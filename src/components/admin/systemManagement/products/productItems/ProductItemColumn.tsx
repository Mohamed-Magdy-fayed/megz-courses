import ProductItemActions from "@/components/admin/systemManagement/products/productItems/ProductItemActions";
import { Checkbox } from "@/components/ui/checkbox";
import { filterFn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

export type ProductItemColumn = {
    id: string;
    productId: string;
    courseId: string;
    courseName: string;
    courseSlug: string;
    levelId?: string;
    levelName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const productItemColumns: ColumnDef<ProductItemColumn>[] = [
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
    { accessorKey: "courseId", cell: ({ row }) => <Link className="in-table-link" href={`/admin/system_management/content/courses/${row.original.courseSlug}`}>{row.original.courseName}</Link> },
    { accessorKey: "levelName" },
    { accessorKey: "updatedAt", cell: ({ row }) => format(row.original.updatedAt, "PPp"), filterFn },
    { accessorKey: "createdAt", cell: ({ row }) => format(row.original.createdAt, "PPp"), filterFn },
    { id: "actions", header: "Actions", cell: ({ row }) => <ProductItemActions {...row.original} /> },
]