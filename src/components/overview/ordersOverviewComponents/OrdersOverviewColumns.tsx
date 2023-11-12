import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import { SeverityPill, SeverityPillProps } from "../SeverityPill";

export type OrderColmun = {
  userId: string;
  orderId: string;
  orderNumber: string;
  userName: string;
  createdAt: string;
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
    header: () => {
      return (
        <Typography variant={"secondary"}>Customer Name</Typography>
      );
    },
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
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          <Typography variant={"secondary"}>Date</Typography>
          <Button
            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          <Typography variant={"secondary"}>Status</Typography>
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
            : status === "paid" ? "success"
              : status === "pending" ? "destructive" : "muted"
      return (
        <SeverityPill color={color}>
          {status}
        </SeverityPill>
      )
    },
  },
];
