import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { Trainer, User } from "@prisma/client";
import ActionCell from "./FinalTestSubmissionsActionCell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";

export type Column = {
    id: string,
    email: string,
    courseName: string,
    student: User,
    trainer: Trainer & {
        user: User
    } | null,
    trainerName: string,
    courseId: string,
    createdAt: Date,
    updatedAt: Date,
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
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Student Info
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
            <Link className="block w-fit" href={`/account/${row.original.student.id}`}>
                <div className="flex items-center gap-2" >
                    <img alt={row.original.student.name} src={row.original.student.image!} className="max-h-12" />
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.student.name}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500 whitespace-normal truncate max-h-14">
                            {row.original.student.email}
                        </Typography>
                    </div>
                </div>
            </Link>
        ),
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
        cell: ({ row }) => {
            return (
                <>{format(row.original.createdAt, "dd MMM yyyy")}</>
            )
        }
    },
    {
        accessorKey: "courseName",
        header: "Course",
        cell: ({ row }) => {
            return (
                <Typography>{row.original.courseName}</Typography>
            )
        }
    },
    {
        accessorKey: "trainerName",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Trainer Info
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => !row.original.trainer ? (
            <Typography>No trainer yet</Typography>
        ) : (
            <Link className="block w-fit" href={`/account/${row.original.trainer?.user.id}`}>
                <div className="flex items-center gap-2" >
                    <Avatar>
                        <AvatarImage src={`${row.original.trainer?.user.image}`} />
                        <AvatarFallback>
                            {getInitials(`${row.original.trainer?.user.name}`)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.trainer?.user.name}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                            {row.original.trainer?.user.email}
                        </Typography>
                    </div>
                </div>
            </Link>
        ),
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            studentId={row.original.student.id}
            courseId={row.original.courseId}
        />,
    },
];
