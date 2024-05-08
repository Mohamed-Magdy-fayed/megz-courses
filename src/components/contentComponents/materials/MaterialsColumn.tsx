import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import MaterialActionCell from "./MaterialActionCell";

export type MaterialsColumn = {
    id: string,
    courseId: string | null,
    createdAt: Date,
    updatedAt: Date,
    frameWorkName: string,
    title: string,
    subTitle: string,
};

export const columns: ColumnDef<MaterialsColumn>[] = [
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
            <Link className="block w-fit" href={`/content/courses/${row.original.id}`}>
                <Typography
                    className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                >
                    {row.original.title}
                </Typography>
                <Typography variant={"secondary"} className="text-sm font-normal text-slate-500 whitespace-normal truncate max-h-14">
                    {row.original.subTitle}
                </Typography>
            </Link >
        ),
    },
    {
        accessorKey: "frameWorkName",
        header: "Framework Name",
        cell: ({ row }) => (
            <Typography>{row.original.frameWorkName}</Typography>
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
        }
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <MaterialActionCell
            id={row.original.id}
            courseId={row.original.courseId!}
        />,
    },
];
