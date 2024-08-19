import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import { formatPrice } from "@/lib/utils";
import CellAction from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { Course, Order } from "@prisma/client";
import Link from "next/link";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { format } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { api } from "@/lib/api";

export type OrderRow = {
  isStudentView: boolean;
  id: string;
  amount: number;
  orderNumber: string;
  paymentId: string;
  salesOperationId: string;
  salesOperationCode: string;
  status: Order["status"];
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string;
  refundRequester: string | null;
  courses: Course[];
  updatedAt: Date;
}

export const columns: ColumnDef<OrderRow>[] = [
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
      <Link href={`/orders/${row.original.orderNumber}`}>
        <Typography>
          {row.original.orderNumber}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "userName",
    header: ({ column }) => {
      if (column.getFacetedRowModel().rows.some(r => r.original.isStudentView)) return null

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
    cell: ({ row }) => {
      if (row.original.isStudentView) return null

      return (
        <Link className="block w-fit" href={`/account/${row.original.userId}`}>
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
      )
    },
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
    header: "Courses",
    cell: ({ row }) => (
      <div className="flex flex-col gap-2">
        {row.original.courses.map(course => (
          <Typography key={course.id}>
            {course.name}
          </Typography>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "salesOperationCode",
    header: ({ column }) => {
      if (column.getFacetedRowModel().rows.some(r => r.original.isStudentView)) return null
      return "Sales Operation"
    },
    cell: ({ row }) => {
      if (row.original.isStudentView) return null

      return (
        <Link href={`/operation/${row.original.salesOperationCode}`}>
          <Typography>
            {row.original.salesOperationCode}
          </Typography>
        </Link>
      )
    },
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
          : status === "refunded" ? "primary"
            : status === "paid" ? "success"
              : status === "pending" ? "muted" : "destructive"

      const refundedByUser = api.users.getUserById.useQuery({ id: row.original.refundRequester || "" }, { enabled: false });

      useEffect(() => {
        if (row.original.refundRequester) refundedByUser.refetch()
      }, [row.original.refundRequester])

      return (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <SeverityPill color={color}>
              {status}
            </SeverityPill>
          </TooltipTrigger>
          <TooltipContent>
            Refunded By: {refundedByUser.data?.user.email ? refundedByUser.data?.user.email : format(row.original.updatedAt, "PPP")}
          </TooltipContent>
        </Tooltip>
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
  {
    id: "action",
    header: ({ column }) => {
      if (column.getFacetedRowModel().rows.some(r => r.original.isStudentView)) return null
      return "Actions"
    },
    cell: ({ row }) => {
      if (row.original.isStudentView) return null
      return (
        <CellAction data={row.original} />
      )
    },
  },
];
