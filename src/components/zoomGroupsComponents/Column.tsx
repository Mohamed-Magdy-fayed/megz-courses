import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "../ui/Typoghraphy";
import { Course, CourseLevel, GroupStatus, Teacher, User } from "@prisma/client";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import Link from "next/link";
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
            <Link className="in-table-link" href={`/admin/operations_management/groups/${row.original.id}`} target="_blank">
                {row.original.groupNumber}
            </Link>
        )
    },
    {
        accessorKey: "groupStatus",
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
        cell: ({ row }) => {
            return (
                <Link className="in-table-link" href={`/admin/users_management/account/${row.original.teacher.userId}`}>
                    {row.original.teacher?.user.name}
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
            <div className="grid place-content-center">
                <SeverityPill color="info" className="w-fit">{row.original.students.length}</SeverityPill>
            </div>
        )
    },
    {
        id: "actions",
        header: "Actions",
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
