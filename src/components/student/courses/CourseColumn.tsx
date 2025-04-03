import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Typography } from "@/components/ui/Typoghraphy";
import Link from "next/link";
import { env } from "@/env.mjs";
import { SeverityPillProps, SeverityPill } from "@/components/ui/SeverityPill";

export type CourseRow = {
  id: string;
  name: string;
  slug: string;
  placementTestLink: string;
  isSubmitted: boolean;
  score: string;
  isOralTestScheduled: boolean;
  oralTestTime: string;
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

export const columns: ColumnDef<CourseRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Course Name
        </div>
      );
    },
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
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Zoom Group
        </div>
      );
    },
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
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Status
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
      if (!row.original.isOralTestScheduled) return <Typography>Not yet Scheduled</Typography>
      if (row.original.isSubmitted) return <Typography>{row.original.oralTestTime}</Typography>

      return (
        <div className="flex flex-col gap-2 items-center">
          <Typography>{row.original.oralTestTime}</Typography>
          <Link href={`/student/placement_test/${row.original.slug}`}>
            <Button customeColor={"primary"}>
              Start
            </Button>
          </Link>
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
