import { ArrowUpDown, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SessionStatus } from "@prisma/client";
import { api } from "@/lib/api";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner";
import { env } from "@/env.mjs";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { format } from "date-fns";

export type SessionColumn = {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  groupId: string;
  groupName: string;
  status: SessionStatus;
  meetingNumber: string;
  meetingPassword: string;
  isSessionOngoing: boolean;
  sessionName: string;
  sessionDate: Date;
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
    accessorKey: "sessionName",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Session
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original

      return (
        <div className="flex flex-col gap-2">
          <Typography>{session.title} Session</Typography>
          {session.isSessionOngoing && (
            <Link target="_blank" href={`/meeting/?mn=${session.meetingNumber}&pwd=${session.meetingPassword}&session_title=${session.title}&session_id=${session.id}&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}edu_team/my_sessions`}>
              <Button type="button" customeColor={"info"}>Join Ongoing Session</Button>
            </Link>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "sessionDate",
    header: "Session Time",
    cell: ({ row }) => (
      <Typography>{format(row.original.sessionDate, "PPPp")}</Typography>
    ),
    filterFn: (row, columnId, filterValue) => {
      const val = row.original.sessionDate
      const startDate = new Date(filterValue.split("|")[0])
      const endDate = new Date(filterValue.split("|")[1])
      return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
    },
  },
  {
    accessorKey: "groupName",
    header: "Zoom Group",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <Link href={`/admin/operations_management/groups/${row.original.groupId}`}>
            <Button variant={"outline"} customeColor={"infoIcon"}>
              <Link2 className="w-4 h-4" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          Go to Group
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    accessorKey: "status",
    header: "Session Status",
    cell: ({ row }) => {
      const session = row.original
      const status = row.original.status

      const { toast } = useToast()
      const [loadingToast, setLoadingToast] = useState<toastType>()

      const trpcUtils = api.useUtils()
      const editSessionStatusMutation = api.zoomGroups.editSessionStatus.useMutation({
        onMutate: () => setLoadingToast(toast({
          title: "Loading...",
          duration: 30000,
          description: <Spinner className="w-4 h-4" />,
          variant: "info",
        })),
        onSuccess: ({ updatedSession }) => trpcUtils.invalidate()
          .then(() => {
            loadingToast?.update({
              id: loadingToast.id,
              title: "Success",
              description: `Session ${updatedSession.materialItem?.title} status updated to ${updatedSession.sessionStatus}`,
              variant: "success",
            })
          }),
        onError: ({ message }) => loadingToast?.update({
          id: loadingToast.id,
          title: "Error",
          description: message,
          variant: "destructive",
        }),
        onSettled: () => {
          loadingToast?.dismissAfter()
          setLoadingToast(undefined)
        }
      })

      if (status === "Scheduled") return (
        <div className="space-y-2 grid">
          <SeverityPill color="primary">Scheduled</SeverityPill>
          <Button
            onClick={() => editSessionStatusMutation.mutate({ id: session.id, sessionStatus: "Starting" })}
            variant={"outline"}
            customeColor={"infoOutlined"}
          >
            Starting Soon
          </Button>
        </div>
      )

      if (status === "Ongoing") return (
        <div className="space-y-2 grid">
          <SeverityPill color="info">Ongoing</SeverityPill>
          <Button
            onClick={() => editSessionStatusMutation.mutate({ id: session.id, sessionStatus: "Completed" })}
            variant={"outline"}
            customeColor={"successOutlined"}
          >
            Complete Session
          </Button>
        </div>
      )

      if (status === "Starting") return (
        <div className="grid space-y-2">
          <Typography>{session.title} Session</Typography>
          <SeverityPill color="secondary">Starting soon</SeverityPill>
          <div className="flex gap-2 items-center [&>*]:flex-grow">
            <Link target="_blank" href={`/meeting/?mn=${session.meetingNumber}&pwd=${session.meetingPassword}&session_title=${session.title}&session_id=${session.id}&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}edu_team/my_sessions`}>
              <Button className="w-full" type="button" customeColor={"info"}>Start Zoom Session</Button>
            </Link>
            <Button
              onClick={() => editSessionStatusMutation.mutate({ id: session.id, sessionStatus: "Ongoing" })}
              variant={"outline"}
              customeColor={"infoOutlined"}
            >
              Start Session
            </Button>
          </div>
        </div>
      )
      if (status === "Completed") return (
        <SeverityPill color="success">Completed</SeverityPill>
      )
      if (status === "Cancelled") return (
        <SeverityPill color="destructive">Cancelled</SeverityPill>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between">
          Created At
        </div>
      );
    },
  },
];
