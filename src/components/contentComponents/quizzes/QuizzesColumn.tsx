import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./QuizzesActionCell";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, GoogleForm, GoogleFormQuestion, MaterialItem } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";

export type QuizRow = {
    id: string,
    materialItemTitle: string,
    levelSlugs: { label: string, value: string }[],
    levelSlug: string,
    levelName: string,
    questions: number,
    submissions: number,
    totalPoints: number,
    isGoogleForm: "true" | "false",
    evalForm: EvaluationForm & {
        materialItem: MaterialItem | null;
        submissions: EvaluationFormSubmission[];
        questions: EvaluationFormQuestion[];
        googleForm?: GoogleForm & {
            googleFormQuestions: GoogleFormQuestion[]
        } | null;
    },
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<QuizRow>[] = [
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
        accessorKey: "isGoogleForm",
        header: "Google Form",
        cell: ({ row }) => !!row.original.evalForm.googleForm?.formRespondUrl ? (
            <Link href={row.original.evalForm.googleForm?.formRespondUrl} target="_blank">
                <Button variant={"icon"} customeColor={"infoIcon"}>
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </Link>
        ) : "No externak link"
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
        header: "Created by"
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            {...row.original}
        />,
    },
];
