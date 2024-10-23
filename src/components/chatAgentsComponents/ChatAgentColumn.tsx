import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/getInitials";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import AgentCellAction from "./AgentActionCell";

export type ChatAgentColumn = {
  id: string
  name: string
  email: string
  phone: string
  image: string
  chats: number
  createdAt: string
}

export const columns: ColumnDef<ChatAgentColumn>[] = [
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
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Info
        </div>
      );
    },
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/account/${row.original.id}`}>
        <div className="flex items-center gap-2 space-x-2" >
          <Avatar>
            <AvatarImage src={`${row.original.image}`} />
            <AvatarFallback>
              {getInitials(`${row.original.name}`)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Typography
              className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
            >
              {row.original.name}
            </Typography>
            <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
              {row.original.email}
            </Typography>
          </div>
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "chats",
    header: "Chats",
    cell: ({ row }) => (
      <div>
        {row.original.chats === 0 ? "no chats" : `${row.original.chats}`}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Joined
        </div>
      );
    },
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <AgentCellAction id={row.original.id} />
      )
    }
  }
];
