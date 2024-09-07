import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import AssigneeCell from "../salesAgentComponents/AssigneeCell";
import CellAction from "./ActionCell";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Typography } from "../ui/Typoghraphy";
import { SeverityPill } from "../overview/SeverityPill";

export type SalesOperationColumn = {
  id: string,
  assigneeId: string,
  assigneeName: string,
  assigneeImage: string,
  assigneeEmail: string,
  code: string,
  status: "created" | "assigned" | "ongoing" | "completed" | "cancelled",
  lastAction: string,
}

export const columns: ColumnDef<SalesOperationColumn>[] = [
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
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <Link className="in-table-link" href={`/sales_operations/${row.original.code}`}>{row.original.code}</Link>
        </TooltipTrigger>
        <TooltipContent>
          Process operation
        </TooltipContent>
      </Tooltip>
    )
  },
  {
    accessorKey: "assigneeEmail",
    header: "Assignee",
    cell: ({ row }) => <AssigneeCell
      assigneeId={row.original.assigneeId}
      assigneeName={row.original.assigneeName}
      assigneeEmail={row.original.assigneeEmail}
      assigneeImage={row.original.assigneeImage}
    />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const color = () => {
        switch (row.original.status) {
          case "assigned":
            return "secondary";
          case "cancelled":
            return "destructive";
          case "completed":
            return "success";
          case "created":
            return "primary";
          case "ongoing":
            return "info";
          default:
            return "muted";
        }
      }

      return (
        <SeverityPill className="w-full" color={`${color()}`}>
          {row.original.status}
        </SeverityPill>
      )
    }
  },
  {
    accessorKey: "lastAction",
    header: "Last Action",
  },
  {
    id: "actions",
    header: () => (
      <Typography variant={"secondary"}>Actions</Typography>
    ),
    cell: ({ row }) => <CellAction
      id={row.original.id}
      code={row.original.code}
      status={row.original.status}
      assigneeId={row.original.assigneeId}
    />,
  },
];
