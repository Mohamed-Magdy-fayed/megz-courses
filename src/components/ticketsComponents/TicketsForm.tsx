import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
//Template
const formSchema = z.object({
    subject: z.string().min(1, "subject can't be empty"),
    info: z.string().min(1, "info can't be empty"),
});

type TicketsFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
    setIsOpen: (val: boolean) => void;
    initialData?: TicketsFormValues;
}

export const TicketsForm: FC<StudentFormProps> = ({ setIsOpen, initialData }) => {
    const [loadingToast, setLoadingToast] = useState<toastType>();

    const { toast } = useToast()

    const action = initialData ? "Edit" : "Create";

    const defaultValues: TicketsFormValues = initialData ? initialData : {
        subject: "",
        info: "",
    };

    const form = useForm<TicketsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const trpcUtils = api.useUtils()
    const createTicketMutation = api.tickets.createTicket.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ ticket }) => {
                setIsOpen(false)
                return `Ticket with ID ${ticket.id}`
            },
            toast,
            trpcUtils,
            loadingMessage: "Submitting your Ticket..."
        })
    )

    const createTicket = ({ info, subject }: TicketsFormValues) => {
        createTicketMutation.mutate({ info, subject })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(createTicket)}>
                <div className="p-4">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        disabled={!!loadingToast}
                                        placeholder="Subject"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="info"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Info</FormLabel>
                                <FormControl>
                                    <Textarea
                                        disabled={!!loadingToast}
                                        placeholder="Ifno"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="p-4 flex justify-end w-full">
                    <Button type="submit" className="ml-auto" disabled={!!loadingToast}>
                        <Typography className={cn("", !!loadingToast && "opacity-0 transition-all")}>{action}</Typography>
                        <Spinner className={cn("w-4 h-4 opacity-0 absolute", !!loadingToast && "opacity-100 transition-all")} />
                    </Button>
                </div>
            </form>
        </Form>
    )
}