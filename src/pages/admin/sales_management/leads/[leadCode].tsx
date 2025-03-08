import { SeverityPill } from "@/components/overview/SeverityPill";
import { Button, SpinnerButton } from "@/components/ui/button";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Phone, Mail, Edit, Replace, Trash, Clock, XIcon, UserIcon, Calendar, UserPlus, ExternalLink, CopyIcon, PhoneIcon, MessageSquareIcon, LaptopIcon } from "lucide-react";
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
import GoBackButton from "@/components/ui/go-back";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import InteractionsForm from "@/components/leads/InteractionsForm";
import { validLeadInteractionsColors } from "@/lib/enumColors";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ZoomSession } from "@prisma/client";
import { preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import { env } from "@/env.mjs";
import CreateOrderModal from "@/components/admin/salesManagement/modals/CreateOrderModal";
import LeadOrdersClient from "@/components/admin/salesManagement/leads/LeadOrdersClient";

export default function LeadPage() {
    const router = useRouter()
    const code = router.query.leadCode as string
    const { data: leadData, isLoading } = api.leads.getByCode.useQuery({ code }, { enabled: !!code })
    const { data: stagesData } = api.leadStages.getLeadStages.useQuery()
    const { data: userData } = api.users.getUserByEmail.useQuery({ email: leadData?.lead?.email! }, { enabled: !!leadData?.lead?.email })

    const [open, setOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSetReminderOpen, setIsSetReminderOpen] = useState(false);
    const [showReminders, setShowReminders] = useState(false);
    const [isEditReminderOpen, setIsEditReminderOpen] = useState(false);
    const [isEditNoteOpen, setIsEditNoteOpen] = useState("");
    const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false);
    const [isEditContactInfo, setIsEditContactInfo] = useState(false);
    const [isScheduleTestOpen, setIsScheduleTestOpen] = useState(false)
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)

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
            successMessageFormatter: ({ updatedLeads }) => `${updatedLeads.count} Leads moved`
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
        if (!leadData?.lead) return
        cancelReminderMutation.mutate({ id: leadData.lead.id })
    }

    const handleRemoveLabel = (labelId: string) => {
        if (!leadData?.lead) return
        removeMutation.mutate({
            labelId,
            leadId: leadData.lead.id,
        })
    }

    const onAssign = (agentId: string) => {
        if (!leadData?.lead) return
        assignMutation.mutate({ agentId, leadId: leadData.lead.id })
    };

    const handleDelete = () => {
        if (!leadData?.lead) return
        deleteMutation.mutate([leadData.lead.id])
    }

    const handleDeleteNote = (noteId: string) => {
        deleteNoteMutation.mutate([noteId])
    }

    const handleMoveLead = (toStageId: string) => {
        if (!leadData?.lead) return
        moveLeadsMutation.mutate({
            leadIds: [leadData.lead.id],
            toStageId,
        })
    }

    const createUserMutation = api.users.createUser.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ user }) => `User with email ${user.email} has been Created!`,
        })
    )

    const handleCreateUser = () => {
        if (!leadData?.lead?.name || !leadData?.lead?.phone || !leadData?.lead?.email) return
        const { name, email, phone } = leadData.lead
        createUserMutation.mutate({
            name,
            phone,
            email,
            password: "Pass.12"
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
            {leadData?.lead?.id && userData?.user && (
                <CreateOrderModal
                    isOpen={isCreateOrderOpen}
                    setIsOpen={setIsCreateOrderOpen}
                    userExists={{
                        leadId: leadData?.lead?.id,
                        studentId: userData?.user.id,
                        studentName: userData?.user.name,
                    }}
                />
            )}
            <GoBackButton />
            {isLoading ? (
                <Spinner className="mx-auto" />
            ) : !leadData?.lead ? (
                <></>
            ) : (
                <div className="p-2 grid xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                    <div className="col-span-full flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <div className="flex flex-col whitespace-nowrap">
                            <ConceptTitle>{leadData.lead.code}</ConceptTitle>
                            <Typography>Created at: {format(leadData.lead.createdAt, "PPp")}</Typography>
                            <Typography>Last Update: {format(leadData.lead.updatedAt, "PPp")}</Typography>
                        </div>
                        <div className="flex flex-col gap-4 p-4 items-end">
                            <LabelsForm leadId={leadData.lead.id} />
                            <div className="flex items-center gap-4 flex-wrap 2xl:max-w-2xl md:max-w-sm max-w-xs">
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
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <Typography variant={"secondary"}>Contact Info</Typography>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 justify-between">
                            <div className="space-y-4">
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
                                                    <UserIcon />
                                                    <Typography>{leadData.lead.name}</Typography>
                                                </div>
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
                                                    {userData?.user ? (
                                                        <Link className="block truncate" href={`/admin/users_management/account/${userData.user.id}`}>
                                                            <Button >
                                                                <ExternalLink className="w-4 h-4" />
                                                                <Typography>Go to account</Typography>
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button onClick={handleCreateUser}>
                                                            <UserPlus className="w-4 h-4" />
                                                            <Typography>Create a User</Typography>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                            <Separator className="sm:hidden" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Typography variant={"secondary"}>Lead management</Typography>
                        </CardHeader>
                        <CardContent className="flex items-stretch flex-wrap gap-4 justify-between md:justify-start">
                            <div className="flex flex-col justify-between gap-2">
                                <Label>Assigned To</Label>
                                <Button onClick={() => setOpen(true)}>
                                    <Replace className="w-4 h-4" />
                                    <Typography>{leadData.lead.assignee?.user.name}</Typography>
                                </Button>
                            </div>
                            <div className="flex flex-col justify-between gap-2">
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
                            <div className="grid gap-2 whitespace-nowrap">
                                <Label>Order</Label>
                                {/* {
                                    leadData.lead.orderDetails
                                        ? (
                                            <div className="flex items-center gap-2">
                                                <Button disabled={!leadData.lead.orderDetails || leadData.lead.orderDetails.status !== "Paid"} onClick={() => setIsScheduleTestOpen(true)}>
                                                    <Calendar className="w-4 h-4" />
                                                    {!leadData.lead.orderDetails?.user?.placementTests[0]?.oralTestTime
                                                        ? (<Typography>Schedule Placement Test</Typography>)
                                                        : (<Typography>Reschedule Placement Test</Typography>)
                                                    }
                                                </Button>
                                                {

                                                    testSession && testSession.session && <PlacemntTestMeetingInfo
                                                        courseName={leadData.lead.orderDetails.course?.name || ""}
                                                        isZoom={!!testSession.isZoom}
                                                        session={testSession.session}
                                                    />
                                                }
                                            </div>
                                        )
                                        : (
                                            <Button disabled={!!leadData.lead.orderDetails || !userData?.user?.email} onClick={() => setIsCreateOrderOpen(true)}>
                                                <Calendar className="w-4 h-4" />
                                                <Typography>Create Order</Typography>
                                            </Button>
                                        )
                                } */}
                                <Button disabled={!userData?.user?.email} onClick={() => setIsCreateOrderOpen(true)}>
                                    <Calendar className="w-4 h-4" />
                                    <Typography>Place an Order</Typography>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Typography variant={"secondary"}>Notes</Typography>
                        </CardHeader>
                        <CardContent>
                            <NotesForm leadId={leadData.lead?.id} />
                            <ScrollArea className="max-h-96">
                                <ScrollBar orientation="vertical" className="bg-primary/20 rounded-lg" />
                                <div className="space-y-4">
                                    {leadData.lead.notes.map(note => (
                                        <div key={note.id}>
                                            {isEditNoteOpen === note.id ? (
                                                <NotesForm leadId={leadData.lead?.id!} initialData={note} setIsOpen={setIsEditNoteOpen} />
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
                                                        <Edit onClick={() => setIsEditNoteOpen(note.id)} className="size-4 cursor-pointer text-info" />
                                                        <Trash onClick={() => setIsDeleteNoteOpen(true)} className="size-4 cursor-pointer text-destructive" />
                                                    </div>
                                                    <div className="bg-muted/10 p-2 rounded-lg">
                                                        <Typography className="whitespace-pre-wrap">{note.value}</Typography>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card className="2xl:col-span-2">
                        <CardHeader>
                            <Typography variant={"secondary"}>Interactions</Typography>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="max-h-80">
                                <ScrollBar orientation="vertical" className="bg-primary/20 rounded-lg" />
                                <div className="space-y-4 bg-muted/5 p-4">
                                    {leadData.lead.interactions.map((interaction, i, self) => (
                                        <div key={interaction.id} className="space-y-2">
                                            <div className={cn("flex items-center justify-between gap-4", interaction.salesAgent?.user.name && "flex-row-reverse")}>
                                                <Typography variant="secondary">{interaction.salesAgent?.user.name || interaction.customer?.name || leadData.lead?.name}</Typography>
                                                {self[i - 1]?.type !== interaction.type && (
                                                    <SeverityPill className="min-w-24 flex items-center justify-between px-2 gap-2" color={validLeadInteractionsColors(interaction.type)}>
                                                        {interaction.type === "Call" && <PhoneIcon className="size-4" />}
                                                        {interaction.type === "Chat" && <MessageSquareIcon className="size-4" />}
                                                        {interaction.type === "Meeting" && <LaptopIcon className="size-4" />}
                                                        {interaction.type}
                                                    </SeverityPill>
                                                )}
                                            </div>
                                            <div className={cn("w-fit", interaction.salesAgent?.user.name ? "ml-auto text-right" : "")}>
                                                <div className={cn("flex items-center gap-2 p-2 bg-muted/10 rounded-lg",)}>
                                                    <Typography className="whitespace-pre-wrap">{interaction.description}</Typography>
                                                </div>
                                                <Typography className="text-xs text-end">{format(interaction.updatedAt, "PPp")}</Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <InteractionsForm leadId={leadData.lead?.id} />
                        </CardContent>
                    </Card>
                    <Card className="2xl:row-start-2 2xl:col-start-3">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <Typography variant={"secondary"}>Reminder</Typography>
                            {leadData.lead.isReminderSet && lastReminder && lastReminder < new Date() ? (
                                <SeverityPill color="destructive" children={"Overdue"} className="px-4" />
                            ) : (
                                <></>
                            )}
                        </CardHeader>
                        <CardContent>
                            {leadData.lead.isReminderSet && lastReminder && lastReminder > new Date() ? (
                                <div className="flex items-center gap-4 justify-between">
                                    {isEditReminderOpen ? (
                                        <RemindersForm setIsOpen={setIsEditReminderOpen} leadId={leadData.lead?.id} initialData={leadData.lead.reminders[leadData.lead.reminders.length - 1]} />
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
                                                    if (leadData.lead?.reminders[leadData.lead?.reminders.length - 1]) handleCancelReminder()
                                                    setIsSetReminderOpen(false)
                                                } else {
                                                    setIsSetReminderOpen(true)
                                                }
                                            }}
                                            icon={Clock}
                                            text={isSetReminderOpen ? "Disable Reminder" : "Enable Reminder"}
                                        />
                                    </div>
                                    {isSetReminderOpen && <RemindersForm setIsOpen={setIsEditReminderOpen} leadId={leadData.lead?.id} />}
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="grid gap-4">
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
                        </CardFooter>
                    </Card>
                    {leadData.lead.orders.length > 0 && (
                        <Card className="col-span-full">
                            <CardContent className="py-4">
                                <LeadOrdersClient leadId={leadData.lead.id} />
                            </CardContent>
                        </Card>
                    )}
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

function PlacemntTestMeetingInfo({ session, isZoom, courseName }: {
    session: ZoomSession;
    courseName: string;
    isZoom: boolean;
}) {
    const sessionURL = preMeetingLinkConstructor({
        isZoom,
        meetingNumber: session.meetingNumber,
        meetingPassword: session.meetingPassword,
        sessionTitle: `Placement Test for course ${courseName}`,
        sessionId: session.id,
    })

    return (
        <div className="flex items-center gap-2">
            <div>
                <WrapWithTooltip text="Open meeting in new tab">
                    <Button disabled={!sessionURL} variant="icon" customeColor="infoIcon">
                        <Link
                            href={`/${sessionURL}`}
                            target="_blank"
                        >
                            <ExternalLink className="size-4" />
                        </Link>
                    </Button>
                </WrapWithTooltip>
                <WrapWithTooltip text="Copy meeting link">
                    <Button
                        disabled={!sessionURL}
                        variant="icon"
                        customeColor="infoIcon"
                        onClick={() => navigator.clipboard.writeText(`${env.NEXT_PUBLIC_NEXTAUTH_URL}${sessionURL}`)}
                    >
                        <CopyIcon className="size-4" />
                    </Button>
                </WrapWithTooltip>
            </div>
        </div>
    )
}
