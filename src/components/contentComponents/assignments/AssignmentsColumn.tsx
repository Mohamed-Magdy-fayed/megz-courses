import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./AssignmentsActionCell";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, GoogleForm, GoogleFormQuestion, MaterialItem } from "@prisma/client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    evalForm: EvaluationForm & {
        materialItem: MaterialItem | null;
        submissions: EvaluationFormSubmission[];
        questions: EvaluationFormQuestion[];
        googleForm: GoogleForm & {
            googleFormQuestions: GoogleFormQuestion[]
        } | null;
    },
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
        accessorKey: "googleFormTitle",
        header: "Form Type",
        cell: ({ row }) => !!row.original.evalForm.googleForm?.formRespondUrl ? (
            <Link href={row.original.evalForm.googleForm?.formRespondUrl} target="_blank">
                <Button customeColor={"infoIcon"}>
                    <ExternalLink className="w-4 h-4" />
                    <Typography>{row.original.googleFormTitle}</Typography>
                </Button>
            </Link>
        ) : "System Form"
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
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            evalForm={row.original.evalForm}
        />,
    },
];
