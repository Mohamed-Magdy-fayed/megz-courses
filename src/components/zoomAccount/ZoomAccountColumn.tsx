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
    completedOnTime: "success";
    completedOffTime: "success";
    cancelled: "destructive";
} = {
    scheduled: "primary",
    ongoing: "info",
    starting: "secondary",
    completedOnTime: "success",
    completedOffTime: "success",
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
            const [day, setDay] = useState<string[]>([])


            return (
                <div className="flex flex-col gap-4 items-start">
                    <SelectField
                        data={row.original.zoomSessions.map(session => ({
                            active: true,
                            label: session.date,
                            value: session.date,
                        }))}
                        listTitle="Day"
                        placeholder="Select Day"
                        setValues={setDay}
                        values={day}
                    />
                    {row.original.zoomSessions.filter(s => s.date === day[0]).map(session => (
                        <Card key={session.date} className="flex flex-col items-start gap-2 p-4">
                            <Typography>
                                Session Date: {session.date}
                            </Typography>
                            <Typography>
                                Students attended: {session.attenders.length}
                            </Typography>
                            <Typography className="flex items-center gap-2">
                                Status: <SeverityPill color={statusMap[session.status]}>{session.status}</SeverityPill>
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
