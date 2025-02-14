import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./AssignmentsActionCell";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

export type AssignmentRow = {
    id: string,
    materialItemTitle: string,
    levelSlugs: { label: string, value: string }[],
    levelName: string,
    levelSlug: string,
    questions: number,
    submissions: number,
    totalPoints: number,
    googleFormTitle: string,
    systemForm: Prisma.SystemFormGetPayload<{ include: { materialItem: true, submissions: { include: { student: true } }, items: { include: { questions: { include: { options: true } } } } } }>,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<AssignmentRow>[] = [
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
        header: "Created on",
        cell: ({ row }) => (
            <Typography>{format(row.original.createdAt, "PPPp")}</Typography>
        ),
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
        accessorKey: "createdBy",
        header: "Created by",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            systemForm={row.original.systemForm}
            levelSlug={row.original.levelSlug}
        />,
    },
];
