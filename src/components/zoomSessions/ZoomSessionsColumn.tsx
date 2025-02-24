import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import { format } from "date-fns";
import { SessionStatus } from "@prisma/client";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import { meetingLinkConstructor, preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import ZoomSessionsActions from "@/components/zoomSessions/ZoomSessionsActions";

export type ZoomSessionsColumn = {
    id: string;
    sessionTitle: string;
    sessionDate: Date;
    meetingNumber: string;
    meetingPassword: string;
    sessionStatus: SessionStatus;
    trainerId: string | undefined;
    trainerName: string;
    isZoom: boolean;
    groupId?: string;
    groupName?: string;
    isTest?: boolean;
}

export const zoomSessionsColumns: ColumnDef<ZoomSessionsColumn>[] = [
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
        cell: ({ row }) => <Typography children={format(row.original.sessionDate, "Pp")} />,
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.sessionDate
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
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
        cell: ({ row }) => <Link className="in-table-link" href={`/admin/users_management/account/${row.original.trainerId}`} children={row.original.trainerName} />
    },
    {
        accessorKey: "groupName",
        cell: ({ row }) => row.original.isTest
            ? <Link className="in-table-link" href={`/admin/operations_management/placement_tests`} children={row.original.groupName} />
            : <Link className="in-table-link" href={`/admin/operations_management/groups/${row.original.groupId}`} children={row.original.groupName} />
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ZoomSessionsActions
            id={row.original.id}
            sessionLink={`/${preMeetingLinkConstructor({
                isZoom: row.original.isZoom,
                meetingNumber: row.original.meetingNumber,
                meetingPassword: row.original.meetingPassword,
                sessionTitle: row.original.groupName || "",
                sessionId: row.original.id,
            })}`}
            isZoom={row.original.isZoom}
            sessionStatus={row.original.sessionStatus}
        />,
    },
];
