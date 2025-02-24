import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { User } from "@prisma/client";
import ActionCell from "@/components/contentComponents/placmentTestSubmissions/PlacementTestSubmissionActionCell";

export type PlacementTestSubmissionsRow = {
    id: string,
    student: User,
    studentName: string,
    rating: string,
    createdAt: Date,
    updatedAt: Date,
};

export const columns: ColumnDef<PlacementTestSubmissionsRow>[] = [
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
        accessorKey: "studentName",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/admin/users_management/account/${row.original.student.id}`}>
                {row.original.student.name}
            </Link>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Submitted at",
        cell: ({ row }) => {
            return (
                <>{format(row.original.createdAt, "dd MMM yyyy")}</>
            )
        }
    },
    {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => {
            return (
                <Typography>{row.original.rating}</Typography>
            )
        }
    },
    {
        id: "action",
        header: "Actions",
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            submission={row.original}
        />,
    }
];
