import AppLayout from "@/components/layout/AppLayout";
import NotesClient from "@/components/notesComponents/NotesClient";
import { NotesForm } from "@/components/notesComponents/NotesForm";
import { SeverityPill, SeverityPillProps } from "@/components/overview/SeverityPill";
import Spinner from "@/components/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Separator } from "@/components/ui/separator";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/getInitials";
import { format } from "date-fns";
import { Edit, StepForward } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NotePage() {
    const router = useRouter();
    const id = router.query.id as string

    const { toast } = useToast()
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [isOpen, setIsOpen] = useState(false);

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

    if (!data?.note) return <Spinner />

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
                title="Edit"
                description="Edit the note"
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <div>
                        <NotesForm initialData={{
                            id: data.note.id,
                            createdAt: format(data.note.createdAt, "PPPPp"),
                            createdByUserName: data.note.createdByUser.name,
                            createdForMentions: data.note.mentions,
                            createdForTypes: data.note.createdFor.join(", "),
                            noteType: data.note.type,
                            sla: data.note.sla.toString(),
                            status: data.note.status,
                            text: data.note.text,
                            updatedAt: format(data.note.updatedAt, "PPPPp"),
                            updateHistory: data.note.updateHistory,
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
                                className="underline decoration-slate-300 hover:text-primary hover:decoration-primary"
                            >
                                {data.note.createdForStudent.name}
                            </Typography>
                            <Typography variant={"secondary"} className="text-sm font-normal text-slate-500">
                                {data.note.createdForStudent.email}
                            </Typography>
                        </div>
                    </div>
                </Link>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <Typography className="py-2" variant={"secondary"}>
                        Created By <Typography className="text-primary">
                            {data.note.createdByUser.name}
                        </Typography>
                    </Typography>
                    <Typography>On {format(data.note.createdAt, "PPPPp")}</Typography>
                </div>
                <div className="flex flex-col">
                    <Typography className="py-2" variant={"secondary"}>
                        Created For {data.note.createdFor
                            .map(item => item === "admin" ? <Typography key={item} className="text-primary">Admins</Typography>
                                : item === "chatAgent" ? <Typography key={item} className="text-primary">Chat Agents</Typography>
                                    : item === "salesAgent" ? <Typography key={item} className="text-primary">Sales Agents</Typography>
                                        : item === "student" ? <Typography key={item} className="text-primary">Students</Typography>
                                            : item === "teacher" ? <Typography key={item} className="text-primary">Teachers</Typography> : "Unknown"
                            )}
                    </Typography>
                    <Typography>Last Update {format(data.note.updatedAt, "PPPPp")}</Typography>
                    <Typography>By {data.note.updateHistory[-1]?.updatedBy}</Typography>
                </div>
            </div>
            <PaperContainer className="space-y-8">
                <div className="flex justify-between gap-12">
                    <Typography className="p-2" variant={"secondary"}>Note Text:</Typography>
                    <Typography className="border border-primary flex-grow p-2" variant={"secondary"}>
                        {data.note.text}
                    </Typography>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Typography variant={"secondary"}>
                                Note Type:
                            </Typography>
                            <SeverityPill color={typeColor}>
                                {type}
                            </SeverityPill>
                        </div>
                        <Typography variant={"secondary"}>
                            Note SLA: <Typography className="text-primary">{data.note.sla}</Typography> Hours
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Typography variant={"secondary"}>
                                Note Status:
                            </Typography>
                            <SeverityPill color={statusColor}>
                                {status}
                            </SeverityPill>
                        </div>
                    </div>
                </div>
            </PaperContainer>
            <div className="flex justify-between gap-4 py-4">
                <div className="flex-grow">
                    <PaperContainer className="space-y-4">
                        <Typography variant={"primary"}>Update History</Typography>
                        {data.note.updateHistory.map(item => (
                            <div key={item.updatedAt.toString()}>
                                <div className="my-4">
                                    <Typography variant={"secondary"}>Updated By: {item.updatedBy}</Typography>
                                    <Typography>Updated At: {format(item.updatedAt, "PPPPp")}</Typography>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Typography variant={"secondary"}>Text: {item.text}</Typography>
                                    <Typography>SLA: {item.sla} Hours</Typography>
                                    <Typography className="py-2 flex gap-2" variant={"secondary"}>
                                        Concerned Teams {item.updatedFor
                                            .map(item => item === "admin" ? <Typography key={item} className="text-primary">Admins</Typography>
                                                : item === "chatAgent" ? <Typography key={item} className="text-primary">Chat Agents</Typography>
                                                    : item === "salesAgent" ? <Typography key={item} className="text-primary">Sales Agents</Typography>
                                                        : item === "student" ? <Typography key={item} className="text-primary">Students</Typography>
                                                            : item === "teacher" ? <Typography key={item} className="text-primary">Teachers</Typography> : "Unknown"
                                            )}
                                    </Typography>
                                </div>
                                <Separator />
                            </div>
                        ))}
                    </PaperContainer>
                </div>
                <div className="space-x-4">
                    <Button onClick={() => setIsOpen(true)} variant={"outline"} customeColor={"primaryOutlined"}>
                        <Edit className="w-4 h-4" />
                        <Typography>Edit</Typography>
                    </Button>
                    {status === "Created" ? (
                        <Button onClick={() => {
                            editNoteMutation.mutate({
                                id,
                                status: "Opened"
                            })
                        }}>
                            <StepForward className="w-4 h-4" />
                            <Typography>Open</Typography>
                        </Button>
                    ) : status === "Opened" ? (
                        <Button onClick={() => {
                            editNoteMutation.mutate({
                                id,
                                status: "Closed"
                            })
                        }}>
                            <StepForward className="w-4 h-4" />
                            <Typography>Close</Typography>
                        </Button>
                    ) : (
                        <Button onClick={() => {
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
        </AppLayout>
    );
}