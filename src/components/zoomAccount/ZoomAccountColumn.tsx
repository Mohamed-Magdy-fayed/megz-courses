import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import CellAction from "@/components/zoomAccount/ZoomAcountActionCell";
import { SessionStatus } from "@prisma/client";
import { Typography } from "@/components/ui/Typoghraphy";
import SelectField from "@/components/salesOperation/SelectField";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import Modal from "@/components/ui/modal";
import { DatePicker } from "@/components/ui/DatePicker";
import Spinner from "@/components/Spinner";
import { Meeting } from "@/server/api/routers/zoomAccounts";
import { format } from "date-fns";
import Calendar from "@/components/ui/calendar";

export type AccountColumn = {
    id: string;
    name: string;
    zoomSessions: {
        date: string;
        status: SessionStatus,
        attenders: string[]
    }[]
    createdAt: string;
};

const statusMap: {
    scheduled: "primary";
    ongoing: "info";
    starting: "secondary";
    completed: "success";
    cancelled: "destructive";
} = {
    scheduled: "primary",
    ongoing: "info",
    starting: "secondary",
    completed: "success",
    cancelled: "destructive"
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
        header: "Name",
    },
    {
        accessorKey: "zoomSessions",
        header: "Account Sessions",
        cell: ({ row }) => {
            const { toast } = useToast();

            const [loadingToast, setLoadingToast] = useState<toastType>()
            const [startDate, setStartDate] = useState<Date | undefined>()
            const [endDate, setEndDate] = useState<Date | undefined>()
            const [isCheckMeetingsOpen, setIsCheckMeetingsOpen] = useState(false)
            const [meetings, setMeetings] = useState<Meeting[]>([])

            const trpcUtils = api.useContext();
            const checkMeetingsMutation = api.zoomAccounts.checkMeetings.useMutation({
                onMutate: () => setLoadingToast(toast({
                    title: "Loading...",
                    variant: "info",
                    description: (
                        <Spinner className="h-4 w-4" />
                    ),
                    duration: 30000,
                })),
                onSuccess: ({ meetings }) => trpcUtils.invalidate().then(() => {
                    loadingToast?.update({
                        id: loadingToast.id,
                        variant: "success",
                        description: `${meetings.length} Meetings found`,
                        title: "Success"
                    })
                    setMeetings(meetings)
                    setIsCheckMeetingsOpen(false)
                }),
                onError: ({ message }) => loadingToast?.update({
                    id: loadingToast.id,
                    variant: "destructive",
                    description: message,
                    title: "Error",
                }),
                onSettled: () => {
                    loadingToast?.dismissAfter()
                    setLoadingToast(undefined)
                },
            })

            const checkMeetings = (startDate?: Date, endDate?: Date) => {
                checkMeetingsMutation.mutate({ id: row.original.id, endDate, startDate })
            }

            return (
                <div className="flex flex-col gap-4 items-start">
                    <Modal
                        title="Check Meetings"
                        description="get all meetings on the account on in selected time"
                        isOpen={isCheckMeetingsOpen}
                        onClose={() => setIsCheckMeetingsOpen(false)}
                        children={(
                            <div className="flex flex-col p-2">
                                <div className="flex gap-2 py-2 justify-between">
                                    <div className="flex flex-col">
                                        <Typography>From Date</Typography>
                                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                    </div>
                                    <div className="flex flex-col">
                                        <Typography>To Date</Typography>
                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                    </div>
                                </div>
                                <Button disabled={!!loadingToast} onClick={() => checkMeetings(startDate, endDate)}>Confirm</Button>
                            </div>
                        )}
                    />
                    <Button
                        disabled={!!loadingToast}
                        onClick={() => {
                            setIsCheckMeetingsOpen(true)
                        }}
                    >
                        Check Meetings
                    </Button>
                    {meetings.length > 0 && (<Button customeColor={"destructive"} onClick={() => setMeetings([])}>Clear</Button>)}
                    {meetings.map(session => (
                        <Card key={session.id} className="flex flex-col items-start gap-2 p-4">
                            <Typography>
                                Session Date: {format(new Date(session.start_time), "PPPpp")}
                            </Typography>
                            <Typography>
                                Topic: {session.topic}
                            </Typography>
                        </Card>
                    ))}
                </div>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <div className="flex items-center justify-between">
                    Added On
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <CellAction
            id={row.original.id}
        />,
    },
];
