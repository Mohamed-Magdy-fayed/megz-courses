import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import CellAction from "./ActionCell";
import { format } from "date-fns";
import { Course, CourseStatus, Order, User } from "@prisma/client";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  address?: string;
  coursesData: {
    courses: (Course & {
      orders: (Order & {
        user: User;
      })[];
    })[];
  } | undefined;
  userData: {
    user: User & { courseStatus: CourseStatus[] }
  }
  createdAt: Date;
};

export const columns: ColumnDef<StudentRow>[] = [
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
      <Link className="in-table-link" href={`/admin/users_management/account/${row.original.id}`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "createdAt",
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.createdAt
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
    cell: ({ row }) => (
      <Typography>{format(row.original.createdAt, "PPP")}</Typography>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction
      id={row.original.id}
      coursesData={row.original.coursesData}
      userData={row.original.userData}
    />,
  },
];
