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
    header: () => {
      return (
        <Typography variant={"secondary"}>Order Number</Typography>
      );
    },
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/orders/${row.original.orderId}`}>
        <Typography
          className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
        >
          {row.original.orderNumber}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "userName",
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/account/${row.original.userId}`}>
        <Typography
          className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
        >
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
  },
];
