import AppLayout from "@/components/layout/AppLayout";
import { SeverityPill } from "@/components/overview/SeverityPill";
import Spinner from "@/components/Spinner";
import { TicketsClient } from "@/components/ticketsComponents/TicketsClient";
import { TicketsForm } from "@/components/ticketsComponents/TicketsForm";
import { Button, SpinnerButton } from "@/components/ui/button";
import GoBackButton from "@/components/ui/go-back";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { validSupportTicketStatusColors } from "@/lib/enumColors";
import { validSupportTicketStatus } from "@/lib/enumsTypes";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { cn } from "@/lib/utils";
import { SupportTicketStatus } from "@prisma/client";
import { format } from "date-fns";
import { PlusSquare, Send } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
//Template
export default function TicketPage() {
    const router = useRouter()
    const id = router.query.id as string

    const { data, isLoading } = api.tickets.findOne.useQuery({ id }, { enabled: !!id })

    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()
    const { toast } = useToast()
    const trpcUtils = api.useContext()
    const updateMutation = api.tickets.editTicketStatus.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ updatedTicket }) => `Ticket status set to ${updatedTicket.status}`,
            toast,
            trpcUtils,
            loadingMessage: "Updating Status..."
        })
    )

    const handleChangeStatus = (val: SupportTicketStatus) => {
        updateMutation.mutate({ id, status: val })
    }

    const [addMessageOpen, setAddMessageOpen] = useState(false)
    const [messageText, setMessageText] = useState("")

    const addMessageMutation = api.tickets.addMessage.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ ticket }) => {
                setAddMessageOpen(false)
                setMessageText("")
                return `Added a new message, total messages is now ${ticket.messages.length}`
            },
            toast,
            trpcUtils,
            loadingMessage: "Adding..."
        })
    )

    const handleAddMessage = () => {
        addMessageMutation.mutate({ id, messageText });
    }

    return (
        <AppLayout>
            {isLoading
                ? (
                    <Spinner className="mx-auto" />
                )
                : (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-2">
                                <GoBackButton />
                                <ConceptTitle>Ticket: {data?.ticket?.subject}</ConceptTitle>
                            </div>
                            <div className="flex flex-col gap-2">
                                <SeverityPill color={validSupportTicketStatusColors(data?.ticket?.status!)}>{data?.ticket?.status}</SeverityPill>
                                <Select
                                    disabled={!!loadingToast}
                                    onValueChange={(val) => handleChangeStatus(val as SupportTicketStatus)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Change Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {validSupportTicketStatus.map(s => (
                                            <SelectItem
                                                key={s}
                                                value={s}
                                                disabled={s === data?.ticket?.status}
                                                className={cn(s === data?.ticket?.status && "text-primary-foreground bg-primary")}
                                            >
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-start justify-between w-full gap-4">
                            <div className="rounded-md bg-muted/10 p-4 flex flex-col gap-2">
                                <Typography variant="secondary">Info</Typography>
                                <Typography>{data?.ticket?.info}</Typography>
                            </div>
                            <SpinnerButton onClick={() => setAddMessageOpen(true)} text="Add a message" icon={PlusSquare} isLoading={isLoading || !!loadingToast} />
                            <Modal
                                title="Add a message"
                                description=""
                                isOpen={addMessageOpen}
                                onClose={() => setAddMessageOpen(false)}
                                children={(
                                    <form onSubmit={(e) => {
                                        e.preventDefault()
                                        handleAddMessage()
                                    }} className="p-4 space-y-4 flex items-center gap-4 justify-between">
                                        <Input type="text" placeholder="Type your message here" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                                        <SpinnerButton
                                            type="submit"
                                            loadingText="Adding..."
                                            icon={Send}
                                            isLoading={isLoading || !!loadingToast}
                                            text="Add Message"
                                        />
                                    </form>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Typography variant="secondary">Messages</Typography>
                            {data?.ticket?.messages.length === 0 ? "No messages yet!" : data?.ticket?.messages.map(({ messageDate, messageText, userEmail, userName }) => (
                                <div key={messageDate.getTime()} className="flex flex-col gap-2">
                                    <Typography className="text-muted text-sm">{format(messageDate, "PPp")}</Typography>
                                    <Typography variant="secondary">By: {userName} - {userEmail}</Typography>
                                    <Typography>{messageText}</Typography>
                                    <Separator />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </AppLayout>
    );
}
