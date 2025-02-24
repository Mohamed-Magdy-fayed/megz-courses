import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import AgentCellAction from "./AgentActionCell";
import { SalesAgent, UserRoles } from "@prisma/client";

export type SalesAgentsColumn = {
  id: string
  name: string
  email: string
  image: string
  phone: string
  tasks: number
  agent: SalesAgent
  agentType: UserRoles[]
  createdAt: string
}

export const columns: ColumnDef<SalesAgentsColumn>[] = [
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
    accessorKey: "email",
    cell: ({ row }) => (
      <Link className="in-table-link" href={`/admin/users_management/account/${row.original.id}`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "phone",
  },
  {
    accessorKey: "tasks",
    cell: ({ row }) => (
      <div>
        {row.original.tasks} Tasks
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <AgentCellAction id={row.original.id} agent={row.original} />
      )
    }
  }
];
