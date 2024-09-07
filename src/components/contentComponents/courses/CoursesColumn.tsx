import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Info } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import CoursesActionCell from "./CoursesActionCell";
import { Typography } from "@/components/ui/Typoghraphy";
import { CourseLevel, Order, User } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
            <Link className="block w-fit" href={`/content/courses/${row.original.slug}`}>
                <div className="flex items-center gap-2" >
                    <img alt={row.original.name} src={row.original.image!} className="max-h-12" />
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.name}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500 whitespace-normal truncate max-h-14">
                            {row.original.description}
                        </Typography>
                    </div>
                </div>
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
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Created on
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
