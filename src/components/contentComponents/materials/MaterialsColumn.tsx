import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import MaterialActionCell from "./MaterialActionCell";
import { MaterialItemType } from "@prisma/client";

export type MaterialsRow = {
    id: string,
    courseSlug: string,
    levelSlugs: { label: string, value: string }[],
    levelSlug: string,
    levelName: string,
    materialItemSlug: string,
    createdAt: Date,
    updatedAt: Date,
    title: string,
    subTitle: string,
    slug: string,
    uploads: string[],
    type: MaterialItemType,
};

export const columns: ColumnDef<MaterialsRow>[] = [
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
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Title
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
            <Link className="block w-fit" href={`/content/materials/${row.original.materialItemSlug}?path=uploads/content/courses/${row.original.courseSlug}/${row.original.levelSlug}/${row.original.materialItemSlug}`}>
                <Typography
                    className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                >
                    {row.original.title}
                </Typography>
            </Link >
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Typography>{row.original.type === "Manual" ? "Interactive" : "Downloadable"}</Typography>
        )
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Created on
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
                <>{format(row.original.createdAt, "dd MMM yyyy")}</>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.createdAt
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
        ),
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <MaterialActionCell
            {...row.original}
        />,
    },
];
