import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import Link from "next/link";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { env } from "@/env.mjs";
import { isTimeNow, isTimePassed } from "@/lib/utils";
import { format } from "date-fns";

export type MyCoursesRow = {
  id: string;
  name: string;
  slug: string;
  placementTestLink: string;
  isSubmitted: boolean;
  score: string;
  isOralTestScheduled: boolean;
  oralTestTime: Date;
  status: string;
  group?: {
    userName: string;
    userEmail: string;
    groupNumber: string;
    meetingNumber: string;
    meetingPassword: string;
    isSessionOngoing: boolean;
    ongoingSession: {
      materialItemTitle: string;
      id: string
    } | undefined;
  }
}

export const myCoursesColumns: ColumnDef<MyCoursesRow>[] = [
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => (
      <Link href={`/my_courses/${row.original.slug}`} className="hover:text-primary">
        <Typography>
          {row.original.name}
        </Typography>
      </Link>
    ),
  },
  {
    accessorKey: "group",
    header: "Zoom Group",
    cell: ({ row }) => {
      const group = row.original.group

      if (group) {
        return (
          <div className="flex flex-col gap-2">
            <Typography>{group.groupNumber}</Typography>
            {group.isSessionOngoing && (
              <Link target="_blank" href={`/meeting/?mn=${group.meetingNumber}&pwd=${group.meetingPassword}&session_title=${group.ongoingSession?.materialItemTitle}&session_id=${group.ongoingSession?.id}&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}my_courses`}>
                <Button type="button" customeColor={"info"}>Join Ongoing Session</Button>
              </Link>
            )}
          </div>
        )
      }

      return <Typography>Not in a group for this course yet</Typography>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const color: SeverityPillProps["color"] =
        status === "Waiting Placement Test" ? "info"
          : status === "Need Submission" ? "primary"
            : status === "Oral Test No Scheduled" ? "destructive"
              : "success"
      if (status)
        return (
          <SeverityPill className="max-w-fit p-2" color={color}>{status}</SeverityPill>
        )
    },
  },
  {
    accessorKey: "isOralTestScheduled",
    header: "Oral Test Time",
    cell: ({ row }) => {
      if (!row.original.isOralTestScheduled) return <Typography>Not yet Scheduled</Typography>

      return (
        <div className="flex flex-col gap-2 items-center">
          <Typography>{format(row.original.oralTestTime, "PPPp")}</Typography>
          {!isTimePassed(row.original.oralTestTime.getTime()) && (
            <Link href={`/placement_test/${row.original.id}`}>
              <Button customeColor={"primary"}>
                Start
              </Button>
            </Link>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "isSubmitted",
    header: "Written Test",
    cell: ({ row }) => {
      if (!row.original.isSubmitted) return (
        <Link href={`/placement_test/${row.original.slug}`}>
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
