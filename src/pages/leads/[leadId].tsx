import { SeverityPill } from "@/components/overview/SeverityPill";
import { Button, SpinnerButton } from "@/components/ui/button";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Phone, Mail, Edit, Replace, Trash, Clock, XIcon, ChevronDown, PlusSquare } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "@/components/layout/AppLayout";
import { AssignModal } from "@/components/modals/AssignModal";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { AlertModal } from "@/components/modals/AlertModal";
import Spinner from "@/components/Spinner";
import LeadsForm from "@/components/leads/LeadsForm";
import LabelsForm from "@/components/leads/LabelsForm";
import RemindersForm from "@/components/leads/RemindersForm";
import NotesForm from "@/components/leads/NotesForm";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/DataTable";
import GoBackButton from "@/components/ui/go-back";

export default function LeadPage() {
    const router = useRouter()
    const id = router.query.leadId as string
    const { data: leadData, isLoading } = api.leads.getById.useQuery({ id }, { enabled: !!id })
    const { data: stagesData } = api.leadStages.getLeadStages.useQuery()

    const [open, setOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditContactInfo, setIsEditContactInfo] = useState(false);
    const [isSetReminderOpen, setIsSetReminderOpen] = useState(false);
    const [showReminders, setShowReminders] = useState(false);
    const [isEditReminderOpen, setIsEditReminderOpen] = useState(false);
    const [isEditNoteOpen, setIsEditNoteOpen] = useState("");
    const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false);
    const [isAddingInteraction, setIsAddingInteraction] = useState(false);

    const [loadingToast, setLoadingToast] = useState<toastType>();
    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const assignMutation = api.leads.assignLead.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ lead }) => {
                setOpen(false)
                return `Lead Assigned to: ${lead.assignee?.user.name}`
            },
        })
    )
    const moveLeadsMutation = api.leads.moveLeads.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ updatedLeads, salesOperations }) => `${updatedLeads.count} Leads moved${salesOperations ? `\n${salesOperations.count} Sales Operation Created` : ""}`
        })
    )
    const deleteMutation = api.leads.deleteLead.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Deleting...",
            successMessageFormatter: ({ deletedLeads }) => {
                router.back()
                return `Deleted ${deletedLeads.count} successfully!`
            }
        })
    )
    const deleteNoteMutation = api.leadNotes.deleteLeadNotes.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Deleting...",
            successMessageFormatter: ({ deletedLeadNotes }) => {
                setIsDeleteNoteOpen(false)
                return `Deleted ${deletedLeadNotes.count} note successfully!`
            }
        })
    )
    const removeMutation = api.leadLabels.removeLeadLabel.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: () => `Removed label successfully!`,
            disableToast: true,
        })
    )
    const cancelReminderMutation = api.leads.cancelReminder.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Deleting...",
            successMessageFormatter: ({ updatedLead }) => updatedLead.isReminderSet ? "Add a reminder" : "Reminder disabled"
        })
    )

    const handleCancelReminder = () => {
        cancelReminderMutation.mutate({ id })
    }

    const handleRemoveLabel = (labelId: string) => {
        removeMutation.mutate({
            labelId,
            leadId: id,
        })
    }

    const onAssign = (agentId: string) => {
        assignMutation.mutate({ agentId, leadId: id })
    };

    const handleDelete = () => {
        deleteMutation.mutate([id])
    }

    const handleDeleteNote = (noteId: string) => {
        deleteNoteMutation.mutate([noteId])
    }

    const handleMoveLead = (toStageId: string) => {
        moveLeadsMutation.mutate({
            leadIds: [id],
            toStageId,
        })
    }

    const lastReminder = useMemo(() => {
        const time = leadData?.lead?.reminders?.at(-1)?.time
        if (time) {
            return time
        }

        return undefined
    }, [leadData?.lead?.reminders])

    return (
        <AppLayout>
            <AssignModal
                isOpen={open}
                loading={!!loadingToast}
                onClose={() => setOpen(false)}
                onConfirm={onAssign}
                defaultValue={leadData?.lead?.assignee?.userId || undefined}
            />
            <AlertModal
                isOpen={isDeleteOpen}
                loading={!!loadingToast}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                description="The lead data can not be restored after this action, are you sure?"
            />
            <GoBackButton />
            {isLoading ? (
                <Spinner className="mx-auto" />
            ) : !leadData?.lead ? (
                <></>
            ) : (
                <div className="p-2 flex flex-col">
                    <ConceptTitle>{leadData.lead.name}</ConceptTitle>
                    <Typography>Lead added on: {format(leadData.lead.createdAt, "PPp")}</Typography>
                    <div className="md:flex gap-4 justify-between">
                        <div className="space-y-4 py-4">
                            <Typography variant={"secondary"}>Contact Information</Typography>
                            <Accordion type="single" collapsible value={isEditContactInfo ? "edit" : "info"}>
                                <AccordionItem className="border-none" value="edit">
                                    <AccordionContent>
                                        <LeadsForm
                                            setIsOpen={setIsEditContactInfo}
                                            initialData={{
                                                id: leadData.lead.id,
                                                name: leadData.lead.name || "",
                                                email: leadData.lead.email || "",
                                                phone: leadData.lead.phone || "",
                                            }}
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem className="border-none" value="info">
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Phone />
                                                <Typography>{leadData.lead.phone}</Typography>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Mail />
                                                <Typography>{leadData.lead.email}</Typography>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <Button customeColor={"infoIcon"} onClick={() => setIsEditContactInfo(!isEditContactInfo)} className="flex items-center gap-4">
                                                    <Typography>Edit Contact Information</Typography>
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                {leadData.lead.labels.length === 0 ? (
                                    <Typography className="text-muted text-sm">Labels help you describe and organize your leads.</Typography>
                                ) : (
                                    leadData.lead.labels.map((label, i) => (
                                        <SeverityPill key={"label" + label + i} className="flex items-center gap-2 px-4" color={"info"}>
                                            <Typography>{label.value}</Typography>
                                            <XIcon className="w-4 h-4 text-destructive cursor-pointer" onClick={() => handleRemoveLabel(label.id)} />
                                        </SeverityPill>
                                    ))
                                )}
                            </div>
                            <div className="max-w-96">
                                <LabelsForm leadId={leadData.lead.id} />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="md:flex md:gap-8 md:[&>*]:w-full">
                        <div className="space-y-4 py-4">
                            <Typography variant={"secondary"}>Lead management</Typography>
                            <div className="flex items-center gap-4 justify-between md:justify-start">
                                <div className="grid gap-2">
                                    <Label>Assigned To</Label>
                                    <Button onClick={() => setOpen(true)}>
                                        <Replace className="w-4 h-4" />
                                        <Typography>{leadData.lead.assignee?.user.name}</Typography>
                                    </Button>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Stage</Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button>
                                                <Replace className="w-4 h-4" />
                                                <Typography>{leadData.lead.leadStage?.name}</Typography>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
                                            {stagesData?.stages?.filter(s => s.name !== leadData.lead?.leadStage?.name).map(stage => (
                                                <DropdownMenuItem key={stage.id} onClick={() => handleMoveLead(stage.id)}>
                                                    {stage.name}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                        <Separator className="md:hidden" />
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <Typography variant={"secondary"}>Reminder</Typography>
                                {lastReminder && lastReminder < new Date() ? (
                                    <SeverityPill color="destructive" children={"Overdue"} className="px-4" />
                                ) : (
                                    <></>
                                )}
                            </div>
                            {lastReminder && lastReminder > new Date() ? (
                                <div className="flex items-center gap-4 justify-between">
                                    {isEditReminderOpen ? (
                                        <RemindersForm setIsOpen={setIsEditReminderOpen} leadId={id} initialData={leadData.lead.reminders[leadData.lead.reminders.length - 1]} />
                                    ) : (
                                        <div className="grid gap-4">
                                            <Typography>{leadData.lead.reminders[leadData.lead.reminders.length - 1]?.title}</Typography>
                                            <Typography>{format(leadData.lead.reminders[leadData.lead.reminders.length - 1]?.time!, "PPPp")}</Typography>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <Button onClick={() => setIsEditReminderOpen(true)} variant={"icon"} customeColor={"infoIcon"}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant={"icon"} customeColor={"destructiveIcon"} onClick={handleCancelReminder}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Set Reminder?</Label>
                                        <SpinnerButton
                                            customeColor={isSetReminderOpen ? "destructive" : "info"}
                                            isLoading={!!loadingToast}
                                            onClick={() => {
                                                if (isSetReminderOpen) {
                                                    if (leadData.lead?.reminders[-1]) handleCancelReminder()
                                                    setIsSetReminderOpen(false)
                                                } else {
                                                    setIsSetReminderOpen(true)
                                                }
                                            }}
                                            icon={Clock}
                                            text={isSetReminderOpen ? "Disable Reminder" : "Enable Reminder"}
                                        />
                                    </div>
                                    {isSetReminderOpen && <RemindersForm setIsOpen={setIsEditReminderOpen} leadId={id} />}
                                </>
                            )}
                            <Button onClick={() => setShowReminders(!showReminders)} customeColor={"infoIcon"}>
                                {showReminders ? "Hide past reminders" : "Show past reminders"}
                            </Button>
                            <Accordion type="single" value={showReminders ? "showReminders" : ""}>
                                <AccordionItem className="border-none" value={"showReminders"}>
                                    <AccordionContent>
                                        <div className="grid gap-2">
                                            {leadData.lead.reminders.map((reminder, i) => (
                                                <div key={reminder.time.toDateString() + i} className="flex items-center gap-4 justify-between">
                                                    <Typography>{reminder.title}</Typography>
                                                    <Typography key={`${reminder.time}${i}`}>{format(reminder.time, "PPPp")}</Typography>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <Typography variant={"secondary"}>Notes</Typography>
                            </div>
                            <NotesForm leadId={id} />
                            {leadData.lead.notes.map(note => (
                                <div key={note.id}>
                                    {isEditNoteOpen === note.id ? (
                                        <NotesForm leadId={id} initialData={note} setIsOpen={setIsEditNoteOpen} />
                                    ) : (
                                        <>
                                            <AlertModal
                                                description="Are you sure?"
                                                isOpen={isDeleteNoteOpen}
                                                loading={!!loadingToast}
                                                onClose={() => setIsDeleteNoteOpen(false)}
                                                onConfirm={() => handleDeleteNote(note.id)}
                                            />
                                            <div className="flex items-center gap-4">
                                                <Typography>{format(note.updatedAt, "PPpp")}</Typography>
                                                <Edit onClick={() => setIsEditNoteOpen(note.id)} className="cursor-pointer text-info" />
                                                <Trash onClick={() => setIsDeleteNoteOpen(true)} className="cursor-pointer text-destructive" />
                                            </div>
                                            <div>
                                                <Typography variant={"pre"}>{note.value}</Typography>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                            }
                        </div>
                    </div>
                    <SpinnerButton
                        className="w-full md:w-60 md:self-center"
                        customeColor={"destructive"}
                        isLoading={!!loadingToast}
                        icon={Trash}
                        text="Delete"
                        onClick={() => setIsDeleteOpen(true)}
                    />
                </div >
            )}
        </AppLayout >
    );
}