import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import { GroupStatus } from "@prisma/client";
import CourseGroupsActionCell from "./CourseGroupsActionCell";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";

export type CourseRow = {
    id: string;
    groupNumber: string;
    groupStatus: GroupStatus;
    startDate: Date;
    levelSlugs: {
        value: string;
        label: string;
    }[],
    levelSlug: string,
    levelName: string,
    studentIds: string[];
    teacherId: string;
    courseId: string,
    courseLevel: {
        id: string;
        name: string;
        slug: string;
    },
    createdAt: Date;
    updatedAt: Date;
}

export const columns: ColumnDef<CourseRow>[] = [
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
                status === "Active" ? "success"
                    : status === "Cancelled" ? "destructive"
                        : status === "Inactive" ? "secondary"
                            : status === "Paused" ? "muted" : "primary"

            return <SeverityPill color={color}>{status}</SeverityPill>
        },
        enableSorting: true
    },
    {
        accessorKey: "levelSlug",
        header: "Level",
        cell: ({ row }) => (
            <Typography>{row.original.levelName}</Typography>
        ),
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <CourseGroupsActionCell
            {...row.original}
        />,
    },
];
