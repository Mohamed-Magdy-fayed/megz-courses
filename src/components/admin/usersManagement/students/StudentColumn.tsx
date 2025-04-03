import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import { Typography } from "@/components/ui/Typoghraphy";
import StudentActions from "@/components/admin/usersManagement/students/ActionCell";
import { filterFn } from "@/lib/utils";
import UserAvatar from "@/components/ui/user/UserAvatar";
import { Devices } from "@prisma/client";

export type StudentColumns = {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  device: Devices | null;
  address: string;
  createdAt: Date;
};

export const studentColumns: ColumnDef<StudentColumns>[] = [
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
  { accessorKey: "name", cell: ({ row }) => <Link className="in-table-link flex items-center gap-2" href={`/admin/users_management/account/${row.original.id}`}><UserAvatar src={row.original.image || ""} />{row.original.name}</Link>, },
  { accessorKey: "address", header: "Address", enableSorting: false },
  { accessorKey: "phone", },
  { accessorKey: "device", },
  { accessorKey: "createdAt", filterFn, cell: ({ row }) => <Typography>{format(row.original.createdAt, "PP")}</Typography> },
  { id: "actions", header: "Actions", cell: ({ row }) => <StudentActions {...row.original} /> },
];
