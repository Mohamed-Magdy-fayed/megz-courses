import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Typography } from "@/components/ui/Typoghraphy";
import Link from "next/link";
import { isTimePassed } from "@/lib/utils";
import { format } from "date-fns";
import { SeverityPill, SeverityPillProps } from "@/components/ui/SeverityPill";
import { preMeetingLinkConstructor } from "@/lib/meetingsHelpers";

export type MyCoursesRow = {
  id: string;
  name: string;
  slug: string;
  placementTestLink: string;
  levelName?: string;
  isSubmitted: boolean;
  score: string;
  isOralTestScheduled: boolean;
  oralTestTime: Date;
  status: string;
  group?: {
    userName: string;
    userEmail: string;
    groupNumber: string;
    isSessionOngoing: boolean;
    ongoingSession: {
      isZoom: boolean;
      meetingNumber: string;
      meetingPassword: string;
      materialItemTitle: string;
      id: string
    } | undefined;
  },
}

export const myCoursesColumns: ColumnDef<MyCoursesRow>[] = [
  {
    accessorKey: "name",
    header: "Course Name",
    cell: ({ row }) => (
      <Link href={`/student/my_courses/${row.original.slug}`} className="hover:text-primary">
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
      const session = group?.ongoingSession

      if (group) {
        return (
          <div className="flex flex-col gap-2">
            <Typography>{group.groupNumber}</Typography>
            {/* {group.isSessionOngoing && ( */}
            <Link target="_blank" href={
              `/${preMeetingLinkConstructor({
                isZoom: !!session?.isZoom,
                sessionTitle: session?.materialItemTitle || "",
                sessionId: session?.id,
                meetingNumber: session?.meetingNumber || "",
                meetingPassword: session?.meetingPassword || "",
              })}`
            }>
              <Button type="button" customeColor={"info"}>Join Ongoing Session</Button>
            </Link>
            {/* )} */}
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
      if (row.original.isSubmitted) return <Typography>Completed: {row.original.levelName}</Typography>

      return (
        <div className="flex flex-col gap-2 items-center">
          <Typography>{format(row.original.oralTestTime, "PPPp")}</Typography>
          {!isTimePassed(row.original.oralTestTime.getTime()) && (
            <Link href={`/student/placement_test/${row.original.slug}`}>
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
        <Link href={`/student/placement_test/${row.original.slug}`}>
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
