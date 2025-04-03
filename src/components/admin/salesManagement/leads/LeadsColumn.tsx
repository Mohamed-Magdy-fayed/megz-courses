import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/utils";
import CellAction from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/Typoghraphy";
import { LeadLabel, LeadSource, LeadStage, Order, Prisma } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { SeverityPill } from "@/components/ui/SeverityPill";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";

export type Lead = {
  userId: string;
  name: string;
  code: string;
  id: string;
  email?: string;
  formId?: string;
  message?: string;
  phone?: string;
  source: LeadSource;
  isOverdue: "Overdue" | "Due today" | "Not set" | "Due later";
  stage: LeadStage | null;
  stages: LeadStage[] | undefined;
  stageName: string;
  assignee: Prisma.SalesAgentGetPayload<{ include: { user: true } }> | null;
  assigneeName: string;
  labels: LeadLabel[];
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const columns: ColumnDef<Lead>[] = [
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
      <button
        className="rounded-full grid place-content-center relative"
        onClick={() => row.toggleSelected()}
        aria-label="Select row"
      >
        <Avatar className={cn("", row.getIsSelected() && `relative after:content-[""] after:inset-0 after:absolute after:bg-primary/40`)}>
          <AvatarImage src={`${row.original.picture}`} />
          <AvatarFallback>
            {getInitials(`${row.original.name}` || "")}
          </AvatarFallback>
        </Avatar>
        {row.getIsSelected() && (<Check className="absolute inset-1/4 text-background" />)}
      </button >
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <WrapWithTooltip text="Process lead">
        <Link className="in-table-link" href={`/admin/sales_management/leads/${row.original.code}`}>{row.original.code}</Link>
      </WrapWithTooltip>
    )
  },
  {
    id: "isOverdue",
    cell: ({ row }) => {
      return (
        <SeverityPill color={
          row.original.isOverdue === "Overdue" ? "destructive"
            : row.original.isOverdue === "Due today" ? "primary"
              : row.original.isOverdue === "Due later" ? "success" : "info"}>
          {row.original.isOverdue}
        </SeverityPill>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
  },
  {
    accessorKey: "email",
    cell: ({ row }) => (
      <Typography>
        {row.original.email}
      </Typography>
    ),
  },
  {
    accessorKey: "phone",
    cell: ({ row }) => (
      <Typography>
        {row.original.phone}
      </Typography>
    ),
  },
  {
    accessorKey: "source",
    cell: ({ row }) => (
      <Typography>
        {row.original.source}
      </Typography>
    ),
  },
  {
    accessorKey: "stageName",
    cell: ({ row }) => (
      <div className="flex items-center justify-between">
        <Typography>
          {row.original.stageName}
        </Typography>
      </div>
    ),
  },
  {
    accessorKey: "assigneeName",
    header: "Agent",
    cell: ({ row }) => row.original.assignee?.id ? (
      <Link href={`/admin/users_management/account/${row.original.assignee?.id}`} className="in-table-link">
        {row.original.assigneeName}
      </Link>
    ) : row.original.assigneeName,
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <Typography>
        {format(row.original.createdAt, "PPp")}
      </Typography>
    ),
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.createdAt
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
