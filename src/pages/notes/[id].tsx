import AppLayout from "@/components/layout/AppLayout";
import UnauthorizedAccess from "@/components/layout/UnauthorizedAccess";
import { NotesForm } from "@/components/notesComponents/NotesForm";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import Spinner from "@/components/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Separator } from "@/components/ui/separator";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/getInitials";
import { format } from "date-fns";
import { Edit, PlusSquare, StepForward } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function NotePage() {
    const { data: sessionData } = useSession();
    const router = useRouter();
    const id = router.query.id as string

    const { toast } = useToast()
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [isOpen, setIsOpen] = useState(false);
    const [isAddMessageOpen, setIsAddMessageOpen] = useState(false);

    const { data } = api.notes.getById.useQuery({ id }, { enabled: !!id })

    const trpcUtils = api.useContext();
    const editNoteMutation = api.notes.editNoteStatus.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: ({ note }) => trpcUtils.notes.invalidate()
            .then(() => {
                setIsOpen(false);
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `${note.type} Note updated`,
                    variant: "success",
                })
            }),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        }
    });

    if (!data?.note) return (
        <AppLayout>
            <Spinner className="mx-auto" />
        </AppLayout>
    )
    if (
        !data.note.mentionsUserIds.some(id => sessionData?.user.id === id)
        && sessionData?.user.userType !== "admin"
        && data.note.createdByUserId !== sessionData?.user.id
    ) return <UnauthorizedAccess />

    const type = data.note.type
    const status = data.note.status
    const typeColor: SeverityPillProps["color"] = type === "Info" ? "info"
        : type === "Followup" ? "primary"
            : type === "Feedback" ? "secondary"
                : type === "Query" ? "muted"
                    : type === "ComplainLevel1" ? "destructive"
                        : type === "ComplainLevel2" ? "destructive"
                            : type === "ComplainLevel3" ? "destructive" : "background"

    const statusColor: SeverityPillProps["color"] = status === "Created" ? "primary"
        : status === "Opened" ? "success"
            : status === "Closed" ? "destructive" : "muted"

    return (
        <AppLayout>
            <Modal
                title="Reply"
                description="Add a reply to the note"
                isOpen={isAddMessageOpen}
                onClose={() => setIsAddMessageOpen(false)}
                children={(
                    <NotesForm initialData={{
                        id: data.note.id,
                        createdAt: data.note.createdAt,
                        createdByUserName: data.note.createdByUser.name,
                        createdForMentions: data.note.mentions,
                        createdForMentionsCount: data.note.mentions.length,
                        noteType: data.note.type,
                        sla: data.note.sla.toString(),
                        status: data.note.status,
                        title: data.note.title,
                        messages: data.note.messages,
                        updatedAt: format(data.note.updatedAt, "PPPPp"),
                        createdForStudent: data.note.createdForStudent,
                    }} setIsOpen={setIsAddMessageOpen} addMessage />
                )}
            />
            <Modal
                title="Edit"
                description="Edit the note"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <div>
                        <NotesForm initialData={{
                            id: data.note.id,
                            createdAt: data.note.createdAt,
                            createdByUserName: data.note.createdByUser.name,
                            createdForMentions: data.note.mentions,
                            createdForMentionsCount: data.note.mentions.length,
                            noteType: data.note.type,
                            sla: data.note.sla.toString(),
                            status: data.note.status,
                            title: data.note.title,
                            messages: data.note.messages,
                            updatedAt: format(data.note.updatedAt, "PPPPp"),
                            createdForStudent: data.note.createdForStudent,
                        }} setIsOpen={setIsOpen} />
                    </div>
                )}
            />
            <div className="space-y-2 flex-col flex pb-8">
                <ConceptTitle>
                    Note for user <Typography className="text-primary">
                        {data.note.createdForStudent.name}
                    </Typography>
                </ConceptTitle>
                <Link className="block w-fit" href={`/account/${data.note.createdForStudent.id}`}>
                    <div className="flex items-center gap-2" >
                        <Typography variant={"secondary"}>User Details</Typography>
                        <Avatar>
                            <AvatarImage src={`${data.note.createdForStudent.image}`} />
                            <AvatarFallback>
                                {getInitials(`${data.note.createdForStudent.name}`)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex gap-2">
                            <Typography
                                className="underline hover:text-primary hover:decoration-primary"
                            >
                                {data.note.createdForStudent.name}
                            </Typography>
                            <Typography variant={"secondary"} className="text-sm font-normal text-muted">
                                {data.note.createdForStudent.email}
                            </Typography>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Typography className="py-2" variant={"secondary"}>
                            Created By
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Typography className="text-primary" variant={"secondary"}>{data.note.createdByUser.name}</Typography>
                            <Badge className="flex items-center bg-info text-info-foreground [&>*]:!text-sm p-1">
                                <Typography variant={"secondary"}>SLA: </Typography>
                                <Typography variant={"secondary"}>{data.note.sla} Hours</Typography>
                            </Badge>
                        </div>
                    </div>
                    <Typography>On {format(data.note.createdAt, "PPPPp")}</Typography>
                </div>
                <div className="flex flex-col">
                    <Typography>Last Update {format(data.note.updatedAt, "PPPPp")}</Typography>
                    <Typography>By {data.note.messages[-1]?.updatedBy}</Typography>
                </div>
            </div>
            <PaperContainer className="space-y-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 whitespace-nowrap border-b w-fit py-2">
                            <Typography variant={"primary"}>Note Title:</Typography>
                            <Typography variant={"primary"} className="text-primary">
                                {data.note.title}
                            </Typography>
                        </div>
                        <div className="grid gap-2 w-fit border-t p-4 self-end">
                            <div className="flex items-center gap-2">
                                <Typography variant={"secondary"}>
                                    Note Type:
                                </Typography>
                                <SeverityPill color={typeColor} className="flex-grow">
                                    {type}
                                </SeverityPill>
                            </div>
                            <div className="flex items-center gap-2">
                                <Typography variant={"secondary"}>
                                    Note Status:
                                </Typography>
                                <SeverityPill color={statusColor} className="flex-grow">
                                    {status}
                                </SeverityPill>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Typography variant={"primary"}>Messages</Typography>
                        {data.note.messages.map(msg => (
                            <>
                                <Separator />
                                <div key={msg.updatedAt.toString()}>
                                    <div className="grid">
                                        <Typography variant={"secondary"}>{msg.updatedBy}</Typography>
                                        <Typography className="whitespace-pre-wrap">{msg.message}</Typography>
                                        <Typography className="text-xs">{format(msg.updatedAt, "PPPPp")}</Typography>
                                    </div>
                                </div>
                            </>
                        ))}
                    </div>
                </div>
                <div className="space-x-4 flex justify-end items-end">
                    <div className="space-x-4 border-t p-4">
                        <Button disabled={data.note.messages.some(msg => msg.updatedBy === "System")} onClick={() => setIsAddMessageOpen(true)} variant={"outline"} customeColor={"primaryOutlined"}>
                            <PlusSquare className="w-4 h-4" />
                            <Typography>Add message</Typography>
                        </Button>
                        <Button disabled={data.note.messages.some(msg => msg.updatedBy === "System")} onClick={() => setIsOpen(true)} variant={"outline"} customeColor={"primaryOutlined"}>
                            <Edit className="w-4 h-4" />
                            <Typography>Edit</Typography>
                        </Button>
                        {status === "Created" ? (
                            <Button disabled={data.note.messages.some(msg => msg.updatedBy === "System")} onClick={() => {
                                editNoteMutation.mutate({
                                    id,
                                    status: "Opened"
                                })
                            }}>
                                <StepForward className="w-4 h-4" />
                                <Typography>Open</Typography>
                            </Button>
                        ) : status === "Opened" ? (
                            <Button disabled={data.note.messages.some(msg => msg.updatedBy === "System")} onClick={() => {
                                editNoteMutation.mutate({
                                    id,
                                    status: "Closed"
                                })
                            }}>
                                <StepForward className="w-4 h-4" />
                                <Typography>Close</Typography>
                            </Button>
                        ) : (
                            <Button disabled={data.note.messages.some(msg => msg.updatedBy === "System")} onClick={() => {
                                editNoteMutation.mutate({
                                    id,
                                    status: "Opened"
                                })
                            }}>
                                <StepForward className="w-4 h-4" />
                                <Typography>Reopen</Typography>
                            </Button>
                        )}
                    </div>
                </div>
            </PaperContainer>
        </AppLayout>
    );
}