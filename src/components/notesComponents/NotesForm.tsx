import SelectField from "@/components/salesOperation/SelectField";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { validNoteTypes, validUserTypes } from "@/lib/enumsTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserNoteTypes } from "@prisma/client";
import { Separator } from "@radix-ui/react-select";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";

const notesFormSchema = z.object({
    text: z.string().min(1, "Note text can't be empty!"),
    createdFor: z.enum(validUserTypes),
    mentions: z.array(z.string()),
    noteType: z.enum(validNoteTypes),
    sla: z.string(),
});

type NotesFormValues = z.infer<typeof notesFormSchema>;
type NotesFormProps = {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const NotesForm = ({ setIsOpen }: NotesFormProps) => {
    const [loading, setLoading] = useState(false);
    const [userTypes, setUserTypes] = useState<("salesAgent" | "chatAgent" | "admin" | "teacher" | "student")[]>(["salesAgent"]);
    const [mentions, setMentions] = useState<string[]>([]);
    const [noteType, setNoteType] = useState<UserNoteTypes[]>(["Info"]);

    const action = "Add Note";

    const defaultValues: NotesFormValues = {
        text: "",
        createdFor: "salesAgent",
        noteType: "Info",
        mentions: [],
        sla: "2"
    };

    const form = useForm<NotesFormValues>({
        resolver: zodResolver(notesFormSchema),
        defaultValues,
    });

    const { data: usersData } = api.users.getUsers.useQuery({ userType: userTypes[0] || "salesAgent" });
    const createNoteMutation = api.notes.createNote.useMutation();
    const router = useRouter();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

    const onSubmit = (data: NotesFormValues) => {
        if (!userTypes[0] || !noteType[0]) return

        setLoading(true);
        createNoteMutation.mutate({
            ...data,
            mentions: mentions,
            noteType: noteType[0],
            createdFor: userTypes[0],
            studentId: router.query.id as string,
        }, {
            onSuccess: ({ note }) => {
                trpcUtils.notes.invalidate()
                    .then(() => {
                        toastSuccess(`Note created successfully`)
                        setIsOpen(false);
                        setLoading(false);
                    })
            },
            onError: (error) => {
                toastError(error.message)
                setLoading(false);
            },
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
                                        disabled={loading}
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
                                        disabled={loading}
                                        placeholder="SLA in hours"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="noteType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Note Type</FormLabel>
                                <FormControl>
                                    <SelectField
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
                        disabled={loading}
                        customeColor="destructive"
                        onClick={() => setIsOpen(false)}
                        type="button"
                    >
                        <Typography variant={"buttonText"}>Cancel</Typography>
                    </Button>
                    <Button
                        disabled={loading}
                        customeColor="accent"
                        type="reset"
                        onClick={() => form.reset()}
                    >
                        <Typography variant={"buttonText"}>Reset</Typography>
                    </Button>
                    <Button disabled={loading} type="submit">
                        <Typography variant={"buttonText"}>{action}</Typography>
                    </Button>
                </div>
            </form>
        </Form>
    )
}