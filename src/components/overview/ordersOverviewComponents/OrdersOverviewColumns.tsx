import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import { SeverityPill, SeverityPillProps } from "../SeverityPill";
import { format } from "date-fns";

export type OrderColmun = {
  userId: string;
  orderId: string;
  orderNumber: string;
  userName: string;
  createdAt: Date;
  status: string;
};

export const columns: ColumnDef<OrderColmun>[] = [
  {
    accessorKey: "orderNumber",
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/orders/${row.original.orderId}`}>
        <Typography>
          {row.original.orderNumber}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "userName",
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/account/${row.original.userId}`}>
        <Typography>
          {row.original.userName}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status
      const color: SeverityPillProps["color"] =
        status === "Cancelled" ? "destructive"
          : status === "Refunded" ? "primary"
            : status === "Paid" ? "success"
              : status === "Pending" ? "destructive" : "muted"
      return (
        <SeverityPill color={color}>
          {status}
        </SeverityPill>
      )
    },
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <Typography>
        {format(row.original.createdAt, "dd MMM yyyy")}
      </Typography>
    ),
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.createdAt
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
  },
];
