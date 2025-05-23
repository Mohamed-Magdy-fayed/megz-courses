import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import CoursesActionCell from "./CoursesActionCell";
import { Typography } from "@/components/ui/Typoghraphy";
import { CourseLevel, Order, User } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { filterFn } from "@/lib/dataTableUtils";

export type CourseRow = {
    id: string,
    name: string,
    slug: string,
    image: string | null,
    createdAt: Date,
    updatedAt: Date,
    description: string | null,
    groupPrice: number,
    privatePrice: number,
    instructorPrice: number,
    levels: CourseLevel[],
    enrollments: number,
};

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
        accessorKey: "name",
        header: "Info",
        cell: ({ row }) => (
            <Link href={`/admin/system_management/content/courses/${row.original.slug}`} className="in-table-link">
                {row.original.name}
            </Link>
        ),
    },
    {
        accessorKey: "groupPrice",
        header: "Group Price",
        cell: ({ row }) => (
            <Typography>{formatPrice(row.original.groupPrice)}</Typography>
        )
    },
    {
        accessorKey: "privatePrice",
        header: "Private Price",
        cell: ({ row }) => (
            <Typography>{formatPrice(row.original.privatePrice)}</Typography>
        )
    },
    {
        accessorKey: "instructorPrice",
        header: "Instructor Price",
        cell: ({ row }) => (
            <Typography>{formatPrice(row.original.instructorPrice)}</Typography>
        )
    },
    {
        accessorKey: "levels",
        header: "Levels",
        cell: ({ row }) => (
            <SeverityPill color="info">{row.original.levels.length}</SeverityPill>
        )
    },
    {
        accessorKey: "enrollments",
        header: "Enrollments",
        cell: ({ row }) => (
            <Typography>{row.original.enrollments}</Typography>
        )
    },
    {
        accessorKey: "createdAt",
        header: "Created on",
        cell: ({ row }) => {
            return (
                <>{format(row.original.createdAt, "dd MMM yyyy")}</>
            )
        },
        filterFn,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <CoursesActionCell
            id={row.original.id}
            slug={row.original.slug}
            levels={row.original.levels.map(level => level.id)}
            name={row.original.name}
            description={row.original.description || ""}
            image={row.original.image || ""}
            privatePrice={row.original.privatePrice}
            groupPrice={row.original.groupPrice}
            instructorPrice={row.original.instructorPrice}
        />,
    },
];
