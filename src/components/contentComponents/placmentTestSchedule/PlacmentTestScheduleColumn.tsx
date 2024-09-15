import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import ActionCell from "./PlacmentTestScheduleActionCell";
import { getInitials } from "@/lib/getInitials";
import { format } from "date-fns";

export type PlacmentTestScheduleRow = {
    id: string;
    isLevelSubmitted: boolean,
    courseId: string,
    courseLevels: { label: string, value: string }[],
    testLink: string,
    studentUserId: string;
    studentName: string;
    studentEmail: string;
    studentImage: string | null;
    oralTestTime: Date;
    trainerId: string;
    trainerName: string;
    trainerEmail: string;
    trainerImage: string | null;
    rating: string;
    link: string;
    createdAt: Date;
    updatedAt: Date;
};

export const columns: ColumnDef<PlacmentTestScheduleRow>[] = [
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
            <Link className="block w-fit" href={`/account/${row.original.studentUserId}`}>
                <div className="flex items-center gap-2" >
                    <img alt={getInitials(row.original.studentName)} src={row.original.studentImage!} className="max-h-12" />
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.studentName}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500 whitespace-normal truncate max-h-14">
                            {row.original.studentEmail}
                        </Typography>
                    </div>
                </div>
            </Link>
        ),
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
        cell: ({ row }) => (
            <Link className="block w-fit" href={`/account/${row.original.trainerId}`}>
                <div className="flex items-center gap-2" >
                    <img alt={getInitials(row.original.trainerName)} src={row.original.trainerImage!} className="max-h-12" />
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.trainerName}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500 whitespace-normal truncate max-h-14">
                            {row.original.trainerEmail}
                        </Typography>
                    </div>
                </div>
            </Link>
        ),
    },
    {
        accessorKey: "oralTestTime",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Test Time
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
            <Typography>{format(row.original.oralTestTime, "PPPp")}</Typography>
        ),
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.createdAt
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
    },
    {
        accessorKey: "rating",
        header: "Rating",
    },
    {
        accessorKey: "createdAt",
        header: "Created On",
        cell: ({ row }) => (
            <Typography>{format(row.original.createdAt, "Pp")}</Typography>
        ),
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            isLevelSubmitted={row.original.isLevelSubmitted}
            testLink={row.original.testLink}
            userId={row.original.studentUserId}
            courseId={row.original.courseId}
            courseLevels={row.original.courseLevels}
        />,
    },
];
