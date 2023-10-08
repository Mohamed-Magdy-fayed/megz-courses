import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import { User } from "@prisma/client";
import Link from "next/link";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { formatPercentage } from "@/lib/utils";

export type CourseRow = {
  id: string;
  name: string;
  formTestStatus?: number | null | undefined;
  oralTestStatus?: number | null | undefined;
  courseStatus: User["courseStatus"][number]["state"]
}

export const columns: ColumnDef<CourseRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Course Name
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
      <Link href={`/courses/${row.original.id}`} className="hover:text-primary">
        <Typography>
          {row.original.name}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "courseStatus",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Status
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
      const status = row.original.courseStatus
      const color: SeverityPillProps["color"] =
        status === "waiting" ? "info"
          : status === "ongoing" ? "primary"
            : "info"
      return (
        <SeverityPill className="max-w-fit p-2" color={color}>{row.original.courseStatus}</SeverityPill>
      )
    },
  },
  {
    accessorKey: "form",
    header: "Placement Test",
    cell: ({ row }) => {
      if (row.original.formTestStatus) return <Typography>Score: {formatPercentage(row.original.formTestStatus)}</Typography>

      return (
        <Link href={`/placement_test/${row.original.id}`}>
          <Button customeColor={"primary"}>
            Start
          </Button>
        </Link>
      )
    },
  },
  {
    accessorKey: "oralTest",
    header: "Oral Placement Test",
    cell: ({ row }) => {
      if (row.original.oralTestStatus) return <Typography>Score: {formatPercentage(row.original.oralTestStatus)}</Typography>

      return (
        <Typography>NA</Typography>
      )
    },
  },
];
