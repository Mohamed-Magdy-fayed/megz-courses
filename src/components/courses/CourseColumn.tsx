import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import Link from "next/link";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import { MouseEvent } from "react";
import useZoomMeeting from "@/hooks/useZoomMeeting";
import { api } from "@/lib/api";
import { MaterialItem, ZoomSession } from "@prisma/client";

export type CourseRow = {
  id: string;
  name: string;
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
    ongoingSession: ZoomSession & {
      materialItem: MaterialItem | null
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
    accessorKey: "group",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Zoom Group
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
      const group = row.original.group

      const { createClient, userId, zoomClient } = useZoomMeeting()

      const generateSDKSignatureQuery = api.zoomMeetings.generateSDKSignature.useMutation({
        onSuccess: ({ meetingConfig, sdkKey }) => {
          console.log(meetingConfig.signature);
          createClient(meetingConfig, sdkKey || "")
        },
      })

      if (group) {
        const join = (e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();

          const meetingConfig = {
            mn: group.meetingNumber,
            name: group.userName,
            pwd: group.meetingPassword,
            role: 0,
            email: group.userEmail,
            lang: "en-US",
            signature: "",
            china: 0,
          }

          generateSDKSignatureQuery.mutate({
            meetingConfig,
          })
        }

        return (
          <div className="flex flex-col gap-2">
            <Typography>{group.groupNumber}</Typography>
            {group.isSessionOngoing && (
              <Link href={`/meeting/?mn=${group.meetingNumber}&pwd=${group.meetingPassword}&session_title=${group.ongoingSession?.materialItem?.title}&session_id=${group.ongoingSession?.id}`}>
                <Button type="button" customeColor={"info"}>Join Ongoing Session</Button>
              </Link>
            )}
          </div>
        )
      }

      return <Typography>No in a group for this course yet</Typography>
    },
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
