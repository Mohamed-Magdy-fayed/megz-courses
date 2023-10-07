import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import AssigneeCell from "./AssigneeCell";
import CellAction from "./ActionCell";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Typography } from "../ui/Typoghraphy";
import { SeverityPill } from "../overview/SeverityPill";

export type SalesOperationColumn = {
  id: string,
  assignee: string,
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
          <Link className="in-table-link" href={`/operation/${row.original.id}`}>{row.original.code}</Link>
        </TooltipTrigger>
        <TooltipContent>
          Process operation
        </TooltipContent>
      </Tooltip>
    )
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => row.original.assignee.length > 0 ? (<AssigneeCell assigneeId={row.original.assignee} />) : (<>Not assigned</>),
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
      assigneeId={row.original.assignee} />,
  },
];
