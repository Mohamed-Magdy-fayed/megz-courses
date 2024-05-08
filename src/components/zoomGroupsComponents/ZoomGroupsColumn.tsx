import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "../ui/Typoghraphy";
import ZoomGroupActionCell from "./ZoomGroupActionCell";
import { Course, GroupStatus, Trainer, User } from "@prisma/client";
import { SeverityPill, SeverityPillProps } from "../overview/SeverityPill";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/getInitials";

export type ZoomGroupColumn = {
    id: string,
    course: Course | null,
    createdAt: Date,
    updatedAt: Date,
    groupNumber: string,
    groupStatus: GroupStatus,
    startDate: Date,
    students: User[],
    trainer: Trainer & {
        user: User
    } | null,
}

export const columns: ColumnDef<ZoomGroupColumn>[] = [
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
        accessorKey: "groupNumber",
        header: "Group Number",
    },
    {
        accessorKey: "groupStatus",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.groupStatus
            const color: SeverityPillProps["color"] =
                status === "active" ? "success"
                    : status === "cancelled" ? "destructive"
                        : status === "inactive" ? "secondary"
                            : status === "paused" ? "muted" : "primary"

            return <SeverityPill color={color}>{status}</SeverityPill>
        }
    },
    {
        accessorKey: "trainer",
        header: "Trainer",
        cell: ({ row }) => {
            return (
                <Link className="block w-fit" href={`/account/${row.original.id}`}>
                    <div className="flex items-center gap-2" >
                        <Avatar>
                            <AvatarImage src={`${row.original.trainer?.user.image}`} />
                            <AvatarFallback>
                                {getInitials(`${row.original.trainer?.user.name}`)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                            <Typography
                                className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                            >
                                {row.original.trainer?.user.name}
                            </Typography>
                            <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                                {row.original.trainer?.user.email}
                            </Typography>
                        </div>
                    </div>
                </Link>
            )
        }
    },
    {
        id: "actions",
        header: () => (
            <Typography variant={"secondary"}>Actions</Typography>
        ),
        cell: ({ row }) => <ZoomGroupActionCell id={row.original.id} />
    },
];
