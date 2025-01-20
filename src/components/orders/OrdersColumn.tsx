import { ColumnDef } from "@tanstack/react-table";
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
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";

export type OrderRow = {
  isStudentView: boolean;
  id: string;
  amount: number;
  orderNumber: string;
  paymentConfirmationImage: string | null;
  paymentId: string;
  leadId: string;
  leadCode: string;
  status: Order["status"];
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string;
  refundRequester: string | null;
  course: Course;
  courseId: string;
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
    accessorKey: "courseId",
    header: "Courses",
    cell: ({ row }) => (
      <div className="flex flex-col gap-2">
        <Typography>
          {row.original.course.name}
        </Typography>
      </div>
    ),
  },
  {
    accessorKey: "leadCode",
    header: ({ column }) => {
      if (column.getFacetedRowModel().rows.some(r => r.original.isStudentView)) return null
      return "Sales Operation"
    },
    cell: ({ row }) => {
      if (row.original.isStudentView) return null

      return (
        <Link href={`/leads/${row.original.leadCode}`}>
          <Typography>
            {row.original.leadCode}
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
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status
      const color: SeverityPillProps["color"] =
        status === "Cancelled" ? "destructive"
          : status === "Refunded" ? "primary"
            : status === "Paid" ? "success"
              : status === "Pending" ? "muted" : "destructive"

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
            {status === "Refunded" && `Refunded By: ${refundedByUser.data?.user.email ? refundedByUser.data?.user.email : format(row.original.updatedAt, "PPP")}`}
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: "paymentConfirmationImage",
    header: "Confirmation Image",
    cell: ({ row }) => (
      <div>
        {(row.original.status === "Paid" && !!row.original.paymentConfirmationImage) && (
          <Dialog>
            <DialogTrigger asChild>
              <Button customeColor={"infoIcon"}>View <EyeIcon /></Button>
            </DialogTrigger>
            <DialogContent>
              <Image className="max-w-2xl" src={row.original.paymentConfirmationImage} alt="Payment Proof" width={1000} height={1000} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Payment Date",
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.updatedAt
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.status === "Pending" || row.original.status === "Cancelled" ? "NA" : format(row.original.updatedAt, "do MMM yy")}
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
