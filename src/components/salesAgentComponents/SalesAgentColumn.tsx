import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Avatar, Stack, Typography } from "@mui/material";
import { getInitials } from "@/lib/getInitials";

export type SalesAgentsColumn = {
  id: string
  name: string
  email: string
  image: string
  phone: string
  salary: string
  tasks: number
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Info
          <Button
            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <Link className="block w-fit" href={`/account/${row.original.id}`}>
        <Stack alignItems="center" direction="row" spacing={2}>
          <Avatar src={`${row.original.image}` || ""}>
            {getInitials(`${row.original.name}` || "")}
          </Avatar>
          <Stack>
            <Typography
              className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
              variant="subtitle2"
            >
              {row.original.name}
            </Typography>
            <Typography className="text-sm font-normal text-slate-500">
              {row.original.email}
            </Typography>
          </Stack>
        </Stack>
      </Link>
    ),
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ row }) => (
      <div>
        ${row.original.salary}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "tasks",
    header: "Tasks",
    cell: ({ row }) => (
      <div>
        {row.original.tasks} Tasks
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Joined
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
];
