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
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { env } from "@/env.mjs";

export type SessionColumn = {
  id: string;
  title: string;
  userName: string;
  userEmail: string;
  groupId: string;
  status: SessionStatus;
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
    accessorKey: "isSessionOngoing",
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
          <Typography>{session.title} Session</Typography>
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
    accessorKey: "groupId",
    header: "Zoom Group",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger>
          <Link href={row.original.groupId}>
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

      const trpcUtils = api.useContext()
      const editSessionStatusMutation = api.zoomGroups.editSessionStatus.useMutation({
        onMutate: () => setLoadingToast(toast({
          title: "Loading...",
          duration: 3000,
          description: <Spinner className="w-4 h-4" />,
          variant: "info",
        })),
        onSuccess: ({ updatedSession }) => trpcUtils.zoomGroups.invalidate()
          .then(() => {
            loadingToast?.update({
              id: loadingToast.id,
              title: "Success",
              description: `Session ${updatedSession.materialItem?.title} status updated to ${updatedSession.sessionStatus}`,
              variant: "success",
            })
            updatedSession.zoomGroup?.students.forEach(student => {
              if (updatedSession.sessionStatus === "starting") sendWhatsAppMessage({
                toNumber: `2${student.phone}` || "201123862218",
                textBody: `Hi ${student.name}, your final test is about to start, be ready!
              \nPlease complete your test here: ${env.NEXT_PUBLIC_NEXTAUTH_URL}/my_courses/${updatedSession.zoomGroup?.course?.slug}/${updatedSession.zoomGroup?.courseLevel?.slug}/quiz/${updatedSession.materialItem?.slug}
              \nAnd join the meeting on time here: ${updatedSession.sessionLink}`,
              })
            })
          }),
        onError: ({ message }) => loadingToast?.update({
          id: loadingToast.id,
          title: "Error",
          description: message,
          variant: "destructive",
        }),
        onSettled: () => setLoadingToast(undefined)
      })

      if (status === "scheduled") return (
        <Button
          onClick={() => editSessionStatusMutation.mutate({ id: session.id, sessionStatus: "starting" })}
          variant={"outline"}
          customeColor={"infoOutlined"}
        >
          Starting Soon
        </Button>
      )

      if (status === "ongoing") return (
        <Button
          onClick={() => editSessionStatusMutation.mutate({ id: session.id, sessionStatus: "completed" })}
          variant={"outline"}
          customeColor={"infoOutlined"}
        >
          Complete Session
        </Button>
      )

      if (status === "starting") return (
        <div className="flex flex-col gap-2">
          <Typography>{session.title} Session</Typography>
          <Link href={`/meeting/?mn=${session.meetingNumber}&pwd=${session.meetingPassword}&session_title=${session.title}&session_id=${session.id}`}>
            <Button type="button" customeColor={"info"}>Start Session</Button>
          </Link>
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
