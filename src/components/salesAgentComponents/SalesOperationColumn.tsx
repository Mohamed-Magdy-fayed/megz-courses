import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import AssigneeCell from "./AssigneeCell";
import { Typography } from "@mui/material";
import CellAction from "./ActionCell";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export type SalesOperationColumn = {
  id: string,
  assignee: string,
  code: string,
  status: string,
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
            <Link className="in-table-link" href={`/ops/${row.original.id}`}>{row.original.code}</Link>
          </TooltipTrigger>
          <TooltipContent className="bg-primary/20">
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
  },
  {
    accessorKey: "lastAction",
    header: "Last Action",
  },
  {
    id: "actions",
    header: () => (
      <Typography>Actions</Typography>
    ),
    cell: ({ row }) => <CellAction
      id={row.original.id}
      code={row.original.code}
      assigneeId={row.original.assignee} />,
  },
];