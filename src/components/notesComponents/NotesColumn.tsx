import NotesActions from "@/components/notesComponents/NotesActions";
import { SeverityPillProps, SeverityPill } from "@/components/overview/SeverityPill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/Typoghraphy";
import { getInitials } from "@/lib/getInitials";
import { NoteUpdate, User, UserNoteStatus, UserNoteTypes } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

export type NotesColumn = {
    id: string,
    title: string,
    messages: NoteUpdate[],
    createdByUserName: string,
    noteType: UserNoteTypes,
    status: UserNoteStatus,
    createdForStudentName?: string,
    createdForStudent?: User,
    createdForMentionsCount: number,
    createdForMentions: User[],
    sla: string,
    createdAt: Date,
    updatedAt: string,
};

export const notesColumns: ColumnDef<NotesColumn>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
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
        accessorKey: "title",
        header: "Note Title",
        cell: ({ row }) => (
            <Link href={`/notes/${row.original.id}`} className="in-table-link">
                {row.original.title}
            </Link>
        )
    },
    {
        accessorKey: "createdByUserName",
        header: "Created By",
        cell: ({ row }) => (
            <Typography>{row.original.createdByUserName}</Typography>
        )
    },
    {
        accessorKey: "messages",
        header: "Messages",
        cell: ({ row }) => (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={"icon"} customeColor={"infoIcon"}>{row.original.messages.length}</Button>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-2">
                    {row.original.messages.map((msg, i) => (
                        <div key={msg.updatedAt.getTime() + i} className="flex flex-col">
                            <div className="flex items-center justify-between text-primary">
                                <Typography>
                                    By {msg.updatedBy}
                                </Typography>
                                <Typography>
                                    At {format(msg.updatedAt, "PPPp")}
                                </Typography>
                            </div>
                            <Typography>{msg.message}</Typography>
                            <Separator />
                        </div>
                    ))}
                </TooltipContent>
            </Tooltip>
        )
    },
    {
        accessorKey: "createdForStudentName",
        header: ({ table }) => table.getCoreRowModel().rows.some(row => row.original.createdForStudent) ? "Student" : "",
        cell: ({ row }) => row.original.createdForStudent ? (
            <Link className="in-table-link" href={`/account/${row.original.createdForStudent.id}`}>
                {row.original.createdForStudent.email}
            </Link>
        ) : ""
    },
    {
        accessorKey: "noteType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.noteType
            const color: SeverityPillProps["color"] = type === "Info" ? "info"
                : type === "Followup" ? "primary"
                    : type === "Feedback" ? "secondary"
                        : type === "Query" ? "muted"
                            : type === "ComplainLevel1" ? "destructive"
                                : type === "ComplainLevel2" ? "destructive"
                                    : type === "ComplainLevel3" ? "destructive" : "background"
            return (
                <SeverityPill color={color}>
                    {row.original.noteType}
                </SeverityPill>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const type = row.original.status
            const color: SeverityPillProps["color"] = type === "Created" ? "primary"
                : type === "Opened" ? "success"
                    : type === "Closed" ? "destructive" : "muted"

            return (
                <SeverityPill color={color}>
                    {type}
                </SeverityPill>
            )
        }
    },
    {
        accessorKey: "sla",
        header: "SLA",
        cell: ({ row }) => {
            return (
                <Typography>{row.original.sla} Hours</Typography>
            )
        }
    },
    {
        accessorKey: "createdForMentionsCount",
        header: "Mentiond Users",
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                {row.original.createdForMentions.map(user => (
                    <Typography key={user.id}>{user.name}</Typography>
                ))}
            </div>
        )
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Created at
                    <Button
                        className="h-fit w-fit rounded-full bg-transparent hover:bg-transparent"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <ArrowUpDown className="h-4 w-4 text-primary" />
                    </Button>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            const val = row.original.createdAt
            const startDate = new Date(filterValue.split("|")[0])
            const endDate = new Date(filterValue.split("|")[1])
            return val.getTime() >= startDate.getTime() && val.getTime() <= endDate.getTime()
        },
        cell: ({ row }) => <Typography>{format(row.original.createdAt, "PPPp")}</Typography>
    },
    {
        id: "action",
        header: "Actions",
        cell: ({ row }) => (
            <NotesActions data={row.original} />
        )
    }
];
