import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { Course, CourseLevels, GroupStatus, Trainer, User, ZoomSession } from "@prisma/client";
import CourseGroupsActionCell from "./CourseGroupsActionCell";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";

export type CourseGroups = {
    id: string;
    groupNumber: string;
    groupStatus: GroupStatus;
    startDate: Date;
    students: User[];
    trainer: (Trainer & {
        user: User;
    });
    zoomSessions: ZoomSession[];
    course: Course,
    courseLevel: CourseLevels,
    createdAt: Date;
    updatedAt: Date;
}

export const columns: ColumnDef<CourseGroups>[] = [
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
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Info
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
            <Link href={`/groups/${row.original.id}`} target="_blank">
                <Button variant={"link"}>
                    <Typography>{row.original.groupNumber}</Typography>
                </Button>
            </Link>
        )
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Start Date
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
                <>{format(row.original.startDate, "dd MMM yyyy")}</>
            )
        }
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
                status === "active" ? "success"
                    : status === "cancelled" ? "destructive"
                        : status === "inactive" ? "secondary"
                            : status === "paused" ? "muted" : "primary"

            return <SeverityPill color={color}>{status}</SeverityPill>
        },
        enableSorting: true
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <CourseGroupsActionCell
            id={row.original.id}
            courseLevel={row.original.courseLevel}
            courseId={row.original.course?.id}
            startDate={row.original.startDate}
            trainerId={row.original.trainer?.id}
            studentIds={row.original.students.map(student => student.id)}
            status={row.original.groupStatus}
        />,
    },
];
