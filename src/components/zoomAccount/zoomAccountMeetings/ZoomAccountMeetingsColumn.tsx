import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import ZoomAccountMeetingsActions from "@/components/zoomAccount/zoomAccountMeetings/ZoomAccountMeetingsActions";
import { Typography } from "@/components/ui/Typoghraphy";
import { format } from "date-fns";
import { SessionStatus } from "@prisma/client";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import { meetingLinkConstructor, preMeetingLinkConstructor } from "@/lib/meetingsHelpers";

export type SessionColumn = {
    id: string;
    sessionTitle: string;
    sessionDate: Date;
    meetingNumber: string;
    meetingPassword: string;
    sessionStatus: SessionStatus;
    trainerId: string;
    trainerName: string;
    isZoom: boolean;
    groupId?: string;
    groupName?: string;
    isTest?: boolean;
}

export const meetingsColumns: ColumnDef<SessionColumn>[] = [
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
        accessorKey: "sessionTitle",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/${meetingLinkConstructor({
                meetingNumber: row.original.meetingNumber,
                meetingPassword: row.original.meetingPassword,
                sessionTitle: row.original.groupName || "",
                sessionId: row.original.id,
            })}`}>
                {row.original.sessionTitle}
            </Link>
        )
    },
    {
        accessorKey: "sessionDate",
        cell: ({ row }) => <Typography children={format(row.original.sessionDate, "Pp")} />
    },
    {
        accessorKey: "sessionStatus",
        cell: ({ row }) => {
            const status = row.original.sessionStatus;

            const statusMap: Record<SessionStatus, SeverityPillProps['color']> = {
                Scheduled: "primary",
                Ongoing: "info",
                Starting: "secondary",
                Completed: "success",
                Cancelled: "destructive"
            };

            const color = statusMap[status] || {};

            return <SeverityPill color={color}>{status}</SeverityPill>;
        }
    },
    {
        accessorKey: "trainerName",
        cell: ({ row }) => <Link className="in-table-link" href={`/account/${row.original.trainerId}`} children={row.original.trainerName} />
    },
    {
        accessorKey: "groupName",
        cell: ({ row }) => row.original.isTest
            ? <Link className="in-table-link" href={`/placement_tests`} children={row.original.groupName} />
            : <Link className="in-table-link" href={`/groups/${row.original.groupId}`} children={row.original.groupName} />
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ZoomAccountMeetingsActions
            id={row.original.id}
            sessionLink={`/${preMeetingLinkConstructor({
                isZoom: row.original.isZoom,
                meetingNumber: row.original.meetingNumber,
                meetingPassword: row.original.meetingPassword,
                sessionTitle: row.original.groupName || "",
                sessionId: row.original.id,
            })}`}
            isZoom={row.original.isZoom}
        />,
    },
];
