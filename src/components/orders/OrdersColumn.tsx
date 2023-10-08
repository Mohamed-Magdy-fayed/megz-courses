import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import { cn, formatPrice } from "@/lib/utils";
import CellAction from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { Course, Order } from "@prisma/client";
import Link from "next/link";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { format } from "date-fns";

export type OrderRow = {
  id: string;
  amount: number;
  orderNumber: string;
  paymentId: string;
  salesOperationId: string;
  salesOperationCode: string;
  status: Order["status"];
  userName: string;
  userEmail: string;
  userImage: string;
  courses: Course[];
  updatedAt: Date;
}

export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Order Number
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
      <Link href={`/orders/${row.original.id}`}>
        <Typography>
          {row.original.orderNumber}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "userName",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          User Info
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
      <Link className="block w-fit" href={`/account/${row.original.id}`}>
        <div className="flex items-center gap-2" >
          <Avatar>
            <AvatarImage src={`${row.original.userImage}`} />
            <AvatarFallback>
              {getInitials(`${row.original.userName}`)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Typography
              className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
            >
              {row.original.userName}
            </Typography>
            <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
              {row.original.userEmail}
            </Typography>
          </div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Amount
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
      <Typography>
        {formatPrice(row.original.amount)}
      </Typography>
    ),
  },
  {
    accessorKey: "courses",
    header: "Courses Count",
    cell: ({ row }) => (
      <Typography>
        {row.original.courses.length} Course(s)
      </Typography>
    ),
  },
  {
    accessorKey: "salesOperationCode",
    header: "Sales Operation",
    cell: ({ row }) => (

      <Link href={`/operation/${row.original.salesOperationId}`}>
        <Typography>
          {row.original.salesOperationCode}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "status",
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
      const status = row.original.status
      const color: SeverityPillProps["color"] =
        status === "cancelled" ? "destructive"
          : status === "done" ? "success"
            : status === "paid" ? "info"
              : status === "pending" ? "muted" : "destructive"
      return (
        <SeverityPill color={color}>
          {status}
        </SeverityPill>
      )
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Payment Date",
    cell: ({ row }) => (
      <Typography>
        {row.original.status === "pending" || row.original.status === "cancelled" ? "NA" : format(row.original.updatedAt, "do MMM yy")}
      </Typography>
    ),
  },
];
