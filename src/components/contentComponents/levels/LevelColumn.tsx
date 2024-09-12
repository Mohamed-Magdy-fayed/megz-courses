import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import CellAction from "./ActionCell";
import { Typography } from "@/components/ui/Typoghraphy";
import { format } from "date-fns";

export type LevelRow = {
  id: string;
  name: string;
  slug: string;
  courseSlug: string;
  createdAt: Date;
};

export const columns: ColumnDef<LevelRow>[] = [
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
    header: "Name",
    cell: ({ row }) => (
      <Typography>{row.original.name}</Typography>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <Typography>{row.original.createdAt.toDateString()}</Typography>
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
    header: () => (
      <Typography variant={"secondary"}>Actions</Typography>
    ),
    cell: ({ row }) => <CellAction
      id={row.original.id}
      name={row.original.name}
      slug={row.original.slug}
    />,
  },
];
