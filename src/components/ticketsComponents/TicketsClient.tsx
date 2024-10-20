import { ticketsColumns } from "@/components/ticketsComponents/TicketsColumn";
import { DataTable } from "@/components/ui/DataTable";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { validSupportTicketStatus } from "@/lib/enumsTypes";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useState } from "react";
//Template
export const TicketsClient = () => {
    const [ids, setIds] = useState<string[]>([])
    const { toast } = useToast()
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()

    const trpcUtils = api.useUtils()
    const { data, isLoading } = api.tickets.findAll.useQuery()
    const deleteMutation = api.tickets.deleteTickets.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedTickets }) => `${deletedTickets.count} Tickets Deleted!`,
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(ids, {
            onSuccess: () => {
                callback?.()
            }
        })
    }

    return (
        <DataTable
            columns={ticketsColumns}
            data={data?.tickets.map(({ id, subject, info, status, createdBy, createdAt, updatedAt, messages }) => ({
                id,
                subject,
                info,
                createdAt,
                updatedAt,
                createdById: createdBy.id,
                createdByName: createdBy.name,
                createdByEmail: createdBy.email,
                createdByPhone: createdBy.phone,
                status,
                messagesCount: messages.length
            })) || []}
            setData={(data) => setIds(data.map(item => item.id))}
            onDelete={onDelete}
            dateRanges={[{ key: "createdAt", label: "Created At" }, { key: "updatedAt", label: "Last Update" }]}
            filters={[{ key: "status", filterName: "Status", values: validSupportTicketStatus.map(s => ({ label: s, value: s })) }]}
            searches={[
                { key: "createdByName", label: "Created By Name" },
                { key: "info", label: "Info" },
                { key: "subject", label: "Subject" },
                { key: "messagesCount", label: "Messages Count" },
            ]}
            skele={!!loadingToast || isLoading}
        />
    )
}
