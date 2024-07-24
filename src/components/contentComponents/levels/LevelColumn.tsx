import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import CellAction from "./ActionCell";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";

export type LevelRow = {
  id: string;
  name: string;
  slug: string;
  courseSlug: string;
  createdAt: string;
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
      <Link href={`/content/courses/${row.original.courseSlug}/level/${row.original.slug}`}>
        <Typography>{row.original.name}</Typography>
      </Link>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "createdAt",
    header: "Added on",
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
