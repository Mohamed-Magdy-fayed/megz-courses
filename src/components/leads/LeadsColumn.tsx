import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, MenuSquare, MoreVertical } from "lucide-react";
import { getInitials } from "@/lib/getInitials";
import { cn } from "@/lib/utils";
import CellAction from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Typography } from "../ui/Typoghraphy";
import { LeadSource, LeadStage, Prisma } from "@prisma/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";

export type Lead = {
  userId: string;
  name: string;
  id: string;
  email?: string;
  formId?: string;
  message?: string;
  phone?: string;
  source: LeadSource;
  stage: LeadStage | null;
  stages: LeadStage[] | undefined;
  stageName: string;
  assignee: Prisma.SalesAgentGetPayload<{ include: { user: true } }> | null;
  assigneeName: string;
  picture?: string;
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Name
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.name}
      </Typography>
    ),
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
    accessorKey: "platform",
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
    accessorKey: "userId",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          ID
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.userId}
      </Typography>
    ),
  },
  {
    accessorKey: "formId",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Form ID
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.formId}
      </Typography>
    ),
  },
  {
    accessorKey: "message",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Message
        </div>
      );
    },
    cell: ({ row }) => (
      <Typography>
        {row.original.message}
      </Typography>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
