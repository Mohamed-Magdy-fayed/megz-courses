import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Info } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import CoursesActionCell from "./CoursesActionCell";
import { Typography } from "@/components/ui/Typoghraphy";
import { CourseLevels, Order, User } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type Course = {
    id: string,
    name: string,
    image: string | null,
    createdAt: Date,
    updatedAt: Date,
    description: string | null,
    groupPrice: number,
    privatePrice: number,
    instructorPrice: number,
    level: CourseLevels,
    oralTest: string,
    orders: (Order & { user: User })[],
};

export const columns: ColumnDef<Course>[] = [
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
            <Link className="block w-fit" href={`/content/courses/${row.original.id}`}>
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
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => {
            const getColor = (): SeverityPillProps["color"] => {
                switch (row.original.level) {
                    case "A0_A1_Beginner_Elementary":
                        return "success"
                    case "A2_Pre_Intermediate":
                        return "info"
                    case "B1_Intermediate":
                        return "foreground"
                    case "B2_Upper_Intermediate":
                        return "muted"
                    case "C1_Advanced":
                        return "primary"
                    case "C2_Proficient":
                        return "destructive"
                }
            }
            const color = getColor()

            return (
                <SeverityPill color={color}>{row.original.level}</SeverityPill>
            )
        }
    },
    {
        accessorKey: "orders",
        header: "Enrollments",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Typography>{row.original.orders.length}</Typography>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="text-info" />
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col">
                        {row.original.orders.map(({ user }) => (<Typography>{user.email}</Typography>))}
                    </TooltipContent>
                </Tooltip>
            </div>
        )
    },
    {
        accessorKey: "oralTest",
        header: "Oral Test",
        cell: ({ row }) => (
            <Link target="_blank" href={row.original.oralTest} >Go to document</Link>
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
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <CoursesActionCell
            id={row.original.id}
        />,
    },
];
