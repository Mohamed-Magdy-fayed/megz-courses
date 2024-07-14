import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import Link from "next/link";

export type SessionColumn = {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  groupNumber: string;
  meetingNumber: string;
  meetingPassword: string;
  isSessionOngoing: boolean;
  createdAt: string;
};

export const columns: ColumnDef<SessionColumn>[] = [
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
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Session
          <Button
            className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original

      return (
        <div className="flex flex-col gap-2">
          <Typography>{session.groupNumber}</Typography>
          {session.isSessionOngoing && (
            <Link href={`/meeting/?mn=${session.meetingNumber}&pwd=${session.meetingPassword}&session_title=${session.title}&session_id=${session.id}`}>
              <Button type="button" customeColor={"info"}>Join Ongoing Session</Button>
            </Link>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Created At
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
