import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import CellAction from "@/components/admin/systemManagement/config/zoomAccount/ZoomAcountActionCell";
import { SessionStatus } from "@prisma/client";
import Link from "next/link";

export type AccountColumn = {
    id: string;
    name: string;
    roomCode: string;
    isZoom: "OnMeeting" | "Zoom";
    zoomSessions: {
        date: string;
        status: SessionStatus,
        attenders: string[]
    }[]
    createdAt: string;
};

export const columns: ColumnDef<AccountColumn>[] = [
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
        accessorKey: "name",
        cell: ({ row }) => (
            <Link className="in-table-link" href={`/admin/system_management/config/zoom/${row.original.id}`}>
                {row.original.name}
            </Link>
        )
    },
    {
        accessorKey: "isZoom",
    },
    {
        accessorKey: "roomCode",
    },
    {
        accessorKey: "createdAt",
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <CellAction
            id={row.original.id}
            isZoom={row.original.isZoom}
        />,
    },
];
