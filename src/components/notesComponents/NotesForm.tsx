import { NotesColumn } from "@/components/notesComponents/NotesColumn";
import SelectField from "@/components/salesOperation/SelectField";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MentionTextarea, { Suggestion } from "@/components/ui/textAreaMentions";
import { Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { validNoteStatus, validNoteTypes } from "@/lib/enumsTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserNoteStatus, UserNoteTypes } from "@prisma/client";
import { Separator } from "@radix-ui/react-select";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const notesFormSchema = z.object({
    title: z.string().min(1, "Note title can't be empty!"),
    message: z.string().min(1, "Please add a message!"),
    mentions: z.array(z.string()),
    noteType: z.enum(validNoteTypes),
    status: z.enum(validNoteStatus).optional(),
    sla: z.string(),
});

type NotesFormValues = z.infer<typeof notesFormSchema>;
type NotesFormProps = {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    initialData?: NotesColumn;
    addMessage?: boolean;
}

export const NotesForm = ({ setIsOpen, initialData, addMessage }: NotesFormProps) => {
    const [mentions, setMentions] = useState<Suggestion[]>(initialData ? initialData.createdForMentions.map(u => ({
        value: u.id,
        label: u.name,
    })) : []);
    const [noteType, setNoteType] = useState<UserNoteTypes[]>(initialData ? [initialData.noteType] : []);
    const [noteStatus, setNoteStatus] = useState<UserNoteStatus[]>(initialData ? [initialData.status] : ["Opened"]);
    const [loadingToast, setLoadingToast] = useState<toastType>();

    const action = addMessage ? "Add Message" : initialData ? "Edit" : "Add Note";

    const defaultValues: NotesFormValues = {
        title: initialData ? initialData.title : "",
        message: (initialData && !addMessage) ? initialData.messages.map(m => m.message).join("\n") : "",
        noteType: initialData ? initialData.noteType : "Info",
        status: initialData ? initialData.status : "Created",
        mentions: initialData ? initialData.createdForMentions.map(u => u.id) : [],
        sla: initialData ? initialData.sla : "2"
    };

    const form = useForm<NotesFormValues>({
        resolver: zodResolver(notesFormSchema),
        defaultValues,
    });

    const createNoteMutation = api.notes.createNote.useMutation({
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
                    description: `${note.type} Note created`,
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
    const editNoteMutation = api.notes.editNote.useMutation({
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

    const addMessageMutation = api.notes.addMessage.useMutation({
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

    const router = useRouter();
    const trpcUtils = api.useUtils();
    const { toast } = useToast()

    const onSubmit = (data: NotesFormValues) => {
        if (addMessage && !!initialData) return addMessageMutation.mutate({
            id: initialData.id,
            message: data.message,
            mentions: mentions.map(m => m.value),
        })

        if (!noteType[0]) return toast({
            title: "Error",
            description: "Please selecet a type",
            variant: "destructive",
        })

        if (!!initialData && !!noteStatus[0]) return editNoteMutation.mutate({
            id: initialData.id,
            mentions: mentions.map(m => m.value),
            noteType: noteType[0],
            sla: data.sla,
            status: noteStatus[0],
        })

        createNoteMutation.mutate({
            ...data,
            mentions: mentions.map(m => m.value),
            noteType: noteType[0],
            studentId: router.query.id as string,
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col justify-between p-2 md:h-full"
            >
                {addMessage ? (
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Note Message</FormLabel>
                                <FormControl>
                                    <MentionTextarea
                                        disabled={!!loadingToast}
                                        placeholder="Explain what you need to note"
                                        value={field.value}
                                        setValue={field.onChange}
                                        name={field.name}
                                        mentions={mentions}
                                        setMentions={setMentions}
                                    />
                                </FormControl>
                                <FormDescription>Type @ to mention a certain user</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : (
                    <div className="p-2 space-y-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="Short brief about the note"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note Message</FormLabel>
                                    <FormControl>
                                        <MentionTextarea
                                            disabled={!!loadingToast || !!initialData}
                                            placeholder="Explain what you need to note"
                                            value={field.value}
                                            setValue={field.onChange}
                                            name={field.name}
                                            mentions={mentions}
                                            setMentions={setMentions}
                                        />
                                    </FormControl>
                                    <FormDescription>Type @ to mention a certain user</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sla"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note SLA</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            disabled={!!loadingToast}
                                            placeholder="SLA in hours"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {initialData && (
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note Status</FormLabel>
                                        <FormControl>
                                            <SelectField
                                                disabled={!!loadingToast}
                                                data={[...validNoteStatus].map(type => ({
                                                    active: true,
                                                    label: type,
                                                    value: type,
                                                }))}
                                                listTitle="Note Type"
                                                placeholder="Select what you want to note"
                                                setValues={setNoteStatus}
                                                values={noteStatus}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="noteType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note Type</FormLabel>
                                    <FormControl>
                                        <SelectField
                                            disabled={!!loadingToast}
                                            data={[...validNoteTypes].map(type => ({
                                                active: true,
                                                label: type,
                                                value: type,
                                            }))}
                                            listTitle="Note Type"
                                            placeholder="Select what you want to note"
                                            setValues={setNoteType}
                                            values={noteType}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                <Separator></Separator>
                <div className="flex p-4 justify-end items-center gap-4 h-full">
                    <Button
                        disabled={!!loadingToast}
                        customeColor="destructive"
                        onClick={() => setIsOpen(false)}
                        type="button"
                    >
                        <Typography variant={"buttonText"}>Cancel</Typography>
                    </Button>
                    <Button
                        disabled={!!loadingToast}
                        customeColor="accent"
                        type="reset"
                        onClick={() => form.reset()}
                    >
                        <Typography variant={"buttonText"}>Reset</Typography>
                    </Button>
                    <Button disabled={!!loadingToast} type="submit">
                        <Typography variant={"buttonText"}>{action}</Typography>
                    </Button>
                </div>
            </form>
        </Form>
    )
}