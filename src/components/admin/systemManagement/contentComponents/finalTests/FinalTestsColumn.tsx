import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./FinalTestsActionCell";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";

export type FinalTestRow = {
    id: string,
    questions: number,
    submissions: number,
    totalPoints: number,
    levelName: string,
    levelSlug: string,
    courseSlug: string,
    systemForm: Prisma.SystemFormGetPayload<{
        include: {
            materialItem: true,
            courseLevel: true,
            items: { include: { questions: { include: { options: true } } } },
            submissions: true,
        }
    }>,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<FinalTestRow>[] = [
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
        accessorKey: "systemForm",
        cell: ({ row }) => (
            <Link href={`/student/my_courses/${row.original.courseSlug}/${row.original.levelSlug}/final_test`}>
                {row.original.systemForm.googleFormUrl ? "Google Form" : "System Form"}
            </Link>
        )
    },
    {
        accessorKey: "questions",
        cell: ({ row }) => (
            <Typography>{row.original.systemForm.items.length}</Typography>
        )
    },
    {
        accessorKey: "submissions",
        cell: ({ row }) => (
            <Typography>{row.original.systemForm.submissions.length}</Typography>
        )
    },
    {
        accessorKey: "totalPoints",
    },
    {
        accessorKey: "levelName",
        header: "Level",
        cell: ({ row }) => {
            return (<Typography>{row.original.systemForm?.courseLevel?.name}</Typography>)
        }
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            systemForm={row.original.systemForm}
            levelSlug={row.original.levelSlug}
        />,
    },
];
