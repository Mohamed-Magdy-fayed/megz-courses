import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./PlacmentTestsActionCell";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, MaterialItem } from "@prisma/client";

export type PlacmentTestRow = {
    id: string,
    questions: number,
    submissions: number,
    totalPoints: number,
    externalLink: string | null,
    evalForm: EvaluationForm & {
        materialItem: MaterialItem | null;
        submissions: EvaluationFormSubmission[];
        questions: EvaluationFormQuestion[];
    },
    createdBy: string,
    createdAt: string,
    updatedAt: string,
};

export const columns: ColumnDef<PlacmentTestRow>[] = [
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
        accessorKey: "createdBy",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Created By
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
    },
    {
        accessorKey: "questions",
    },
    {
        accessorKey: "submissions",
    },
    {
        accessorKey: "totalPoints",
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Created at
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            externalLink={row.original.externalLink}
            evalForm={row.original.evalForm}
        />,
    },
];
