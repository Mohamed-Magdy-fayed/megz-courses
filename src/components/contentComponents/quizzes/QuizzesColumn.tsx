import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./QuizzesActionCell";

export type Column = {
    id: string,
    materialItemTitle: string,
    questions: number,
    submissions: number,
    totalPoints: number,
    createdBy: string,
    createdAt: string,
    updatedAt: string,
};

export const columns: ColumnDef<Column>[] = [
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
        accessorKey: "materialItemTitle",
        header: "Material Item Title"
    },
    {
        accessorKey: "questions",
        header: "Questions"
    },
    {
        accessorKey: "submissions",
        header: "Submissions"
    },
    {
        accessorKey: "totalPoints",
        header: "Total Points"
    },
    {
        accessorKey: "createdAt",
        header: "Created on"
    },
    {
        accessorKey: "createdBy",
        header: "Created by"
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
        />,
    },
];
