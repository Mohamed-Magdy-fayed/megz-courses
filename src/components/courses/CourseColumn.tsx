import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import Link from "next/link";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { formatPercentage } from "@/lib/utils";
import { format } from "date-fns";

export type CourseRow = {
  id: string;
  name: string;
  placementTestLink: string;
  isSubmitted: boolean;
  score: string;
  isOralTestScheduled: boolean;
  oralTestTime: string;
  status: string;
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
      <Link href={`/my_courses/${row.original.id}`} className="hover:text-primary">
        <Typography>
          {row.original.name}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "status",
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
      const status = row.original.status
      const color: SeverityPillProps["color"] =
        status === "Waiting Placement Test" ? "info"
          : status === "Need Submission" ? "primary"
            : status === "Oral Test No Scheduled" ? "primary"
              : "success"
      return (
        <SeverityPill className="max-w-fit p-2" color={color}>{status}</SeverityPill>
      )
    },
  },
  {
    accessorKey: "isOralTestScheduled",
    header: "Oral Test Time",
    cell: ({ row }) => {
      if (row.original.isOralTestScheduled) return <Typography>{row.original.oralTestTime}</Typography>

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
    accessorKey: "isSubmitted",
    header: "Written Test",
    cell: ({ row }) => {
      if (row.original.score === "Not Submitted") return (
        <Link href={`/placement_test/${row.original.id}`}>
          <Button customeColor={"primary"}>
            Start
          </Button>
        </Link>
      )

      return (
        <Typography>{row.original.score}</Typography>
      )
    },
  },
];
