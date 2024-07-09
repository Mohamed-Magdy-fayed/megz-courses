import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import CellAction from "./PlacementTestTimesActionCell";
import { Typography } from "../ui/Typoghraphy";

export type PlacementTestTimesColumn = {
  id: string;
  time: string;
  updatedAt: string;
  createdAt: string;
}

export const columns: ColumnDef<PlacementTestTimesColumn>[] = [
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
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "updatedAt",
    header: "Last Action",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    id: "actions",
    header: () => (
      <Typography variant={"secondary"}>Actions</Typography>
    ),
    cell: ({ row }) => <CellAction
      id={row.original.id}
    />,
  },
];
