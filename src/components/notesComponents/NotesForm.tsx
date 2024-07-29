import { NotesColumn } from "@/components/notesComponents/NotesColumn";
import SelectField from "@/components/salesOperation/SelectField";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { validNoteStatus, validNoteTypes, validUserTypes } from "@/lib/enumsTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserNoteStatus, UserNoteTypes, UserType } from "@prisma/client";
import { Separator } from "@radix-ui/react-select";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const notesFormSchema = z.object({
    text: z.string().min(1, "Note text can't be empty!"),
    createdFor: z.array(z.enum(validUserTypes)),
    mentions: z.array(z.string()),
    noteType: z.enum(validNoteTypes),
    status: z.enum(validNoteStatus).optional(),
    sla: z.string(),
});

type NotesFormValues = z.infer<typeof notesFormSchema>;
type NotesFormProps = {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    initialData?: NotesColumn;
}

export const NotesForm = ({ setIsOpen, initialData }: NotesFormProps) => {
    const [userTypes, setUserTypes] = useState<UserType[]>(initialData ? initialData.createdForTypes.split(", ") as UserType[] : ["salesAgent"]);
    const [mentions, setMentions] = useState<string[]>(initialData ? initialData.createdForMentions.map(u => u.id) : []);
    const [noteType, setNoteType] = useState<UserNoteTypes[]>([initialData ? initialData.noteType : "Info"]);
    const [noteStatus, setNoteStatus] = useState<UserNoteStatus[]>(initialData ? [initialData.status] : ["Opened"]);
    const [loadingToast, setLoadingToast] = useState<toastType>();

    const action = initialData ? "Edit" : "Add Note";

    const defaultValues: NotesFormValues = {
        text: initialData ? initialData.text : "",
        createdFor: initialData ? initialData.createdForTypes.split(", ") as UserType[] : ["salesAgent"],
        noteType: initialData ? initialData.noteType : "Info",
        status: initialData ? initialData.status : "Created",
        mentions: initialData ? initialData.createdForMentions.map(u => u.id) : [],
        sla: initialData ? initialData.sla : "2"
    };

    const form = useForm<NotesFormValues>({
        resolver: zodResolver(notesFormSchema),
        defaultValues,
    });

    const { data: usersData } = api.users.getUsers.useQuery({ userType: userTypes[0] || "salesAgent" });
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

    const router = useRouter();
    const trpcUtils = api.useContext();
    const { toast } = useToast()

    const onSubmit = (data: NotesFormValues) => {
        if (!userTypes[0] || !noteType[0]) return

        if (!!initialData && !!noteStatus[0]) return editNoteMutation.mutate({
            id: initialData.id,
            createdFor: userTypes,
            mentions,
            noteType: noteType[0],
            sla: data.sla,
            status: noteStatus[0],
            text: data.text,
        })

        createNoteMutation.mutate({
            ...data,
            mentions: mentions,
            noteType: noteType[0],
            createdFor: userTypes,
            studentId: router.query.id as string,
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col justify-between p-0 md:h-full"
            >
                <div className="p-2">
                    <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Note Text</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!!loadingToast}
                                        placeholder="Please check this about the user"
                                        {...field}
                                    />
                                </FormControl>
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
                    <FormField
                        control={form.control}
                        name="createdFor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>User types to see this note</FormLabel>
                                <FormControl>
                                    <SelectField
                                        disabled={!!loadingToast}
                                        multiSelect
                                        data={[...validUserTypes].map(type => ({
                                            active: true,
                                            label: type,
                                            value: type,
                                        }))}
                                        listTitle="User Types"
                                        placeholder="Select who should see this note"
                                        setValues={setUserTypes}
                                        values={userTypes}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mentions"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Want to mention a specific user?</FormLabel>
                                <FormControl>
                                    {usersData?.users &&
                                        <SelectField
                                            disabled={!!loadingToast}
                                            multiSelect
                                            data={usersData.users.map(user => ({
                                                active: true,
                                                label: user.name,
                                                value: user.id,
                                            }))}
                                            listTitle="Mentions"
                                            placeholder="Select users to mentions"
                                            setValues={setMentions}
                                            values={mentions}
                                        />
                                    }
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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