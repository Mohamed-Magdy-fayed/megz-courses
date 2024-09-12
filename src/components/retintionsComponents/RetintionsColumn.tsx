import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { format } from "date-fns";
import { Course, CourseStatus, Order, User } from "@prisma/client";

export type RetintionsRow = {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  address?: string;
  latestCourse: string;
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
    accessorKey: "email",
    header: "Info",
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/account/${row.original.id}`}>
        <div className="flex items-center gap-2" >
          <Avatar>
            <AvatarImage src={`${row.original.image}`} />
            <AvatarFallback>
              {getInitials(`${row.original.name}`)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Typography
              className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
            >
              {row.original.name}
            </Typography>
            <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
              {row.original.email}
            </Typography>
          </div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "latestCourse",
    header: "Latest Course",
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
