import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Check } from "lucide-react";
import { Avatar, Typography } from "@mui/material";
import { getInitials } from "@/lib/getInitials";
import { PotintialCustomer } from "@prisma/client";
import { cn } from "@/lib/utils";
import CellAction from "./cell-action";

export const columns: ColumnDef<PotintialCustomer>[] = [
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

        <Avatar src={`${row.original.picture}` || ""} className={cn("", row.getIsSelected() && `relative after:content-[""] after:inset-0 after:absolute after:bg-primary/40`)}>
          {getInitials(`${row.original.firstName} ${row.original.lastName}` || "")}
        </Avatar>
        {row.getIsSelected() && (<Check className="absolute inset-1/4 text-white" />)}
      </button >
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          First Name
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
      <Typography>
        {row.original.firstName}
      </Typography>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Last Name
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
      <Typography>
        {row.original.lastName}
      </Typography>
    ),
  },
  {
    accessorKey: "facebookUserId",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          E-mail
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
      <Typography>
        example@mail.com
      </Typography>
    ),
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Phone number
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
      <Typography>
        01234567890
      </Typography>
    ),
  },
  {
    id: "actions",
    header: () => (
      <Typography>Actions</Typography>
    ),
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
