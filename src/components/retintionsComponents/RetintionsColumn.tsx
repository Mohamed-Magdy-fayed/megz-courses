import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { format } from "date-fns";
import { Course, CourseStatus, Order, User } from "@prisma/client";
import { Button } from "@/components/ui/button";

export type RetintionsRow = {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  address?: string;
  latestCourse: string;
  latestLevel: string;
  userData: {
    user: User & { courseStatus: CourseStatus[] }
  }
  createdAt: Date;
};

export const columns: ColumnDef<RetintionsRow>[] = [
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
      <Link className="in-table-link" href={`/account/${row.original.id}`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "latestCourse",
    header: "Latest Course",
  },
  {
    accessorKey: "latestLevel",
    header: "Latest Level",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      let filterFn = column.getFilterFn()?.resolveFilterValue
      filterFn = (val) => JSON.parse(val)
      return (
        <div className="flex items-center justify-between">
          User Since
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.createdAt
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
    cell: ({ row }) => (
      <Typography>{format(row.original.createdAt, "dd/MMM/yyyy")}</Typography>
    ),
  },
];
