import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { UserRoles } from "@prisma/client";
import EducationalTeamActionCell from "@/components/admin/usersManagement/staffComponents/EducationalTeamActionCell";

export type TrainerColumn = {
  id: string;
  userId: string;
  name: string;
  userRoles: UserRoles;
  email: string;
  image: string;
  phone: string;
  createdAt: string;
};

export const columns: ColumnDef<TrainerColumn>[] = [
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
    header: "Info",
    cell: ({ row }) => (
      <Link className="in-table-link" href={`/admin/users_management/account/${row.original.userId}`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "phone",
  },
  {
    accessorKey: "userRoles",
  },
  {
    accessorKey: "createdAt",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <EducationalTeamActionCell
      trainerUser={{ ...row.original, id: row.original.userId }}
    />,
  }
];
