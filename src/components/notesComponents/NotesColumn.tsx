import NotesActions from "@/components/notesComponents/NotesActions";
import { SeverityPillProps, SeverityPill } from "@/components/overview/SeverityPill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Typography } from "@/components/ui/Typoghraphy";
import { getInitials } from "@/lib/getInitials";
import { NoteUpdate, User, UserNoteStatus, UserNoteTypes, UserType } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";

export type NotesColumn = {
    id: string,
    text: string,
    createdByUserName: string,
    noteType: UserNoteTypes,
    status: UserNoteStatus,
    createdForStudent?: User,
    createdForTypes: string,
    createdForMentions: User[],
    sla: string,
    updateHistory: NoteUpdate[],
    createdAt: string,
    updatedAt: string,
};

export const columns: ColumnDef<NotesColumn>[] = [
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
        accessorKey: "text",
        header: "Note Text",
        cell: ({ row }) => (
            <Link href={`/notes/${row.original.id}`}>
                <Typography className="whitespace-pre-wrap hover:underline hover:text-primary">{row.original.text}</Typography>
            </Link>
        )
    },
    {
        accessorKey: "createdForStudent",
        header: ({ table }) => table.getCoreRowModel().rows.some(row => row.original.createdForStudent) ? "Student" : "",
        cell: ({ row }) => row.original.createdForStudent ? (
            <Link className="block w-fit" href={`/account/${row.original.createdForStudent.id}`}>
                <div className="flex items-center gap-2" >
                    <Avatar>
                        <AvatarImage src={`${row.original.createdForStudent.image}`} />
                        <AvatarFallback>
                            {getInitials(`${row.original.createdForStudent.name}`)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Typography
                            className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                        >
                            {row.original.createdForStudent.name}
                        </Typography>
                        <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                            {row.original.createdForStudent.email}
                        </Typography>
                    </div>
                </div>
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
        accessorKey: "createdForTypes",
        header: "For Types",
        cell: ({ row }) => {
            return (
                <Typography>{row.original.createdForTypes}</Typography>
            )
        }
    },
    {
        accessorKey: "createdForMentions",
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
    },
    {
        id: "action",
        header: "Actions",
        cell: ({ row }) => (
            <NotesActions data={row.original} />
        )
    }
];
