import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import CoursesActionCell from "./CoursesActionCell";
import { Typography } from "@/components/ui/Typoghraphy";
import { CourseLevel, Order, User } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

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
    orders: (Order & { user: User })[],
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
            <div
                style={{ backgroundImage: `url(${row.original.image})` }}
                className="group max-w-60 bg-cover bg-center rounded-xl overflow-hidden"
            >
                <Link href={`/content/courses/${row.original.slug}`} className="flex items-center gap-2 bg-background/60 p-2 w-full h-full">
                    <div className="flex flex-col gap-2 w-full" >
                        <div className="flex gap-2">
                            <Typography
                            variant={"secondary"}
                                className="underline decoration-foreground font-extrabold text-foreground group-hover:text-primary group-hover:decoration-primary"
                            >
                                {row.original.name}
                            </Typography>
                        </div>
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger>
                                Description
                            </TooltipTrigger>
                            <TooltipContent>
                                {row.original.description}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </Link>
            </div>
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
            <div className="space-y-2 flex flex-col">
                {
                    row.original.levels.map(level => (
                        <Typography key={level.id}>{level.name}</Typography>
                    ))
                }
            </div>
        )
    },
    {
        accessorKey: "enrollments",
        header: "Enrollments",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Typography>{row.original.orders.length}</Typography>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="text-info" />
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col">
                        {row.original.orders.map(({ user }) => (<Typography key={user.id}>{user.email}</Typography>))}
                    </TooltipContent>
                </Tooltip>
            </div>
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
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.createdAt
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
    },
    {
        accessorKey: "slug",
        header: undefined,
        cell: undefined,
    },
    {
        accessorKey: "description",
        header: undefined,
        cell: undefined,
    },
    {
        id: "actions",
        header: () => (
            <Typography>Actions</Typography>
        ),
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
