import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "../ui/Typoghraphy";
import { Course, CourseLevel, GroupStatus, Teacher, User } from "@prisma/client";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import ActionCell from "./ActionCell";

export type ColumnType = {
    id: string,
    course: Course,
    courseLevel: CourseLevel,
    createdAt: Date,
    updatedAt: Date,
    groupNumber: string,
    groupStatus: GroupStatus,
    startDate: Date,
    studentsCount: number,
    students: User[],
    teacherName: string,
    teacher: Teacher & {
        user: User
    },
}

export const columns: ColumnDef<ColumnType>[] = [
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
        accessorKey: "groupNumber",
        header: "Group Number",
        cell: ({ row }) => (
            <Link href={`/groups/${row.original.id}`} target="_blank">
                <Button variant={"link"}>
                    <Typography>{row.original.groupNumber}</Typography>
                </Button>
            </Link>
        )
    },
    {
        accessorKey: "groupStatus",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Status
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
            const status = row.original.groupStatus
            const color: SeverityPillProps["color"] =
                status === "Completed" ? "success"
                    : status === "Cancelled" ? "destructive"
                        : status === "Inactive" ? "secondary"
                            : status === "Active" ? "info"
                                : status === "Paused" ? "muted" : "primary"

            return <SeverityPill color={color}>{status}</SeverityPill>
        },
        enableSorting: true
    },
    {
        accessorKey: "teacherName",
        header: "Trainer",
        cell: ({ row }) => {
            return (
                <Link className="block w-fit" href={`/account/${row.original.teacher.userId}`}>
                    <div className="flex items-center gap-2" >
                        <Avatar>
                            <AvatarImage src={`${row.original.teacher?.user.image}`} />
                            <AvatarFallback>
                                {getInitials(`${row.original.teacher?.user.name}`)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                            <Typography
                                className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                            >
                                {row.original.teacher?.user.name}
                            </Typography>
                            <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                                {row.original.teacher?.user.email}
                            </Typography>
                        </div>
                    </div>
                </Link>
            )
        }
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (<Typography>{format(row.original.startDate, "PPPp")}</Typography>)
    },
    {
        accessorKey: "studentsCount",
        header: "Students",
        filterFn: "weakEquals",
        cell: ({ row }) => (
            <Typography>{row.original.students.length}</Typography>
        )
    },
    {
        id: "actions",
        header: () => (
            <Typography className="text-muted">Actions</Typography>
        ),
        cell: ({ row }) => <ActionCell
            id={row.original.id}
            courseId={row.original.course.id}
            courseLevel={row.original.courseLevel}
            startDate={row.original.startDate}
            teacherId={row.original.teacher?.id}
            studentIds={row.original.students.map(student => student.id)}
            status={row.original.groupStatus}
        />
    },
];
