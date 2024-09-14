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

export type GoogleAccountColumn = {
    id: string;
    name: string;
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

export const columns: ColumnDef<GoogleAccountColumn>[] = [
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
