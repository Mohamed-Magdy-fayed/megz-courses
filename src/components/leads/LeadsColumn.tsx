import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/utils";
import CellAction from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { LeadLabel, LeadSource, LeadStage, Order, Prisma, Reminder } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
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
  orderDetails: Order | null;
  isReminderSet: boolean;
  reminders: Reminder[];
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
      <WrapWithTooltip text="Process operation">
        <Link className="in-table-link" href={`/leads/${row.original.code}`}>{row.original.code}</Link>
      </WrapWithTooltip>
    )
  },
  {
    accessorKey: "name",
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Email
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.email}
      </Typography>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Phone
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.phone}
      </Typography>
    ),
  },
  {
    accessorKey: "source",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Source
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.source}
      </Typography>
    ),
  },
  {
    accessorKey: "stageName",
    header: "Stage",
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
    cell: ({ row }) => (
      <div className="flex items-center justify-between">
        <Typography>
          {row.original.assigneeName}
        </Typography>
      </div>
    ),
  },
  {
    accessorKey: "labels",
    header: "Labels",
    cell: ({ row }) => {
      const validColors: SeverityPillProps["color"][] = [
        "background",
        "destructive",
        "foreground",
        "info",
        "muted",
        "primary",
        "secondary",
        "success",
      ]
      return (
        <div className="flex flex-wrap items-center gap-4">
          {row.original.labels.map((label, i) => (
            <SeverityPill color={validColors[i] || validColors[i - validColors.length - 1] || "info"} key={label.id}>
              {label.value}
            </SeverityPill>
          ))}
        </div>
      )
    },
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
