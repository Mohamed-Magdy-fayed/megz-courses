import { SpinnerButton } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { PlusSquare } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageTemplate } from "@prisma/client";

export const formSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    body: z.string().min(1, "Template body is required").max(500, "Template body is too long"),
});

type FormValues = z.infer<typeof formSchema>;

const WhatsAppTemplatesForm = ({ setIsOpen, initialData }: { setIsOpen: Dispatch<SetStateAction<boolean>>, initialData?: Partial<MessageTemplate> }) => {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? initialData : {
            name: "",
            body: "",
        },
    });

    const trpcUtils = api.useUtils();
    const addTemplateMutation = api.whatsAppTemplates.createMessageTemplate.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Saving template...",
            successMessageFormatter: ({ newTemplate }) => {
                setIsOpen(false);
                return `Template "${newTemplate.name}" Created successfully`;
            },
        })
    );

    const handleCreate = (data: FormValues) => {
        addTemplateMutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="Order Notification"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Template Body</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={!!loadingToast}
                                    placeholder="Hello {{name}}, your order {{orderNumber}} is ready!"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {initialData?.placeholders && (
                    <div className="p-4">
                        <FormLabel>Placeholders</FormLabel>
                        <div className="space-y-1">
                            {initialData.placeholders.length > 0 ? (
                                initialData.placeholders.map((placeholder, index) => (
                                    <p key={index} className="text-sm text-muted">
                                        {placeholder}
                                    </p>
                                ))
                            ) : (
                                <p className="text-sm text-muted">No placeholders detected.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <SpinnerButton
                        icon={PlusSquare}
                        isLoading={!!loadingToast}
                        text="Save Template"
                        type="submit"
                    />
                </div>
            </form>
        </Form>
    );
};

export default WhatsAppTemplatesForm;
