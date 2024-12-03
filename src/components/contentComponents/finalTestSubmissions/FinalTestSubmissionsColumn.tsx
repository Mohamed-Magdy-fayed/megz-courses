import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { Certificate, User } from "@prisma/client";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ActionCell from "@/components/contentComponents/finalTestSubmissions/FinalTestsSubmissionActionCell";

export type FinalTestSubmissionRow = {
    id: string;
    answers: {
        questionId: string;
        selectedAnswers: string[];
        textAnswer: string | null;
        isCorrect: boolean;
    }[];
    student: User;
    levelSlugs: { label: string, value: string }[],
    levelSlug: string,
    certificate: Certificate | undefined;
    email: string;
    courseId: string;
    courseName: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
};

export const columns: ColumnDef<FinalTestSubmissionRow>[] = [
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
                    <Avatar>
                        <AvatarImage src={`${row.original.student.image}`} />
                        <AvatarFallback>
                            {getInitials(`${row.original.student.name}`)}
                        </AvatarFallback>
                    </Avatar>
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
        header: "Submitted at",
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
        accessorKey: "courseName",
        header: "Course",
        cell: ({ row }) => {
            return (
                <Typography>{row.original.courseName}</Typography>
            )
        }
    },
    {
        accessorKey: "levelSlug",
        header: "Level",
        cell: ({ row }) => {
            return (
                <Typography>{row.original.levelSlugs.find(s => s.value === row.original.levelSlug)?.label}</Typography>
            )
        }
    },
    {
        accessorKey: "certificate",
        header: "Certificate",
        cell: ({ row }) => {
            const certificate = row.original.certificate
            if (!certificate) return "No Certificate yet"

            return (
                <Link href={`/certificates/${certificate.certificateId}`} className="flex flex-col gap-2">
                    <Typography>
                        {certificate.certificateId}
                    </Typography>
                    <Typography>
                        {format(certificate.completionDate, "PPP")}
                    </Typography>
                </Link>
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
