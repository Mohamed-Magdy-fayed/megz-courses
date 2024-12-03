import { SpinnerButton } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ImageUploader from '@/components/ui/ImageUploader';
import { Input } from '@/components/ui/input';
import MobileNumberInput from '@/components/ui/phone-number-input';
import { toastType, useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { createMutationOptions } from '@/lib/mutationsHelper';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConstructionIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const setupFormSchema = z.object({
    setupKey: z.string().min(4, "Please add your setup key to continue!"),
    name: z.string(),
    email: z.string().email("Not a valid Email").min(5, "Please add your email"),
    password: z.string().min(6, "Password must be at least 6 characters long")
        .refine(
            (value) =>
                /[a-z]/.test(value) &&
                /[A-Z]/.test(value) &&
                /[0-9]/.test(value) &&
                /[!@#$%^&*(),.?":{}|<>]/.test(value),
            {
                message: "Password must include uppercase, lowercase, number, and special character",
            }
        ),
    image: z.string().optional(),
    phone: z.string(),
});

export type SetupFormValues = z.infer<typeof setupFormSchema>;

export default function SetupForm() {
    const defaultValues: SetupFormValues = {
        setupKey: "",
        name: "",
        image: "",
        email: "",
        password: "",
        phone: "",
    }

    const form = useForm<SetupFormValues>({
        resolver: zodResolver(setupFormSchema),
        defaultValues,
    });

    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const { toast } = useToast()
    const trpcUtils = api.useUtils();
    const setupMutation = api.setup.start.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            successMessageFormatter: () => `Setup Completed Successfully! now login with the Admin's email and password`,
            toast,
            trpcUtils,
            loadingMessage: "Configuring..."
        })
    )

    const onSubmit = (setupData: SetupFormValues) => {
        setupMutation.mutate(setupData)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="p-8 space-y-4 flex flex-col"
            >
                <div className="md:grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="setupKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Setup Key</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        disabled={!!loadingToast}
                                        placeholder="XXXXXXXX"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!!loadingToast}
                                        placeholder="Jon Doe"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Email</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!!loadingToast}
                                        placeholder="example@mail.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Phone</FormLabel>
                                <FormControl>
                                    <MobileNumberInput
                                        placeholder="01111111111"
                                        setValue={field.onChange}
                                        value={field.value}
                                        onError={(e) => {
                                            if (!!e) {
                                                form.setError("phone", { message: "Invalid Phone Number" })
                                                return
                                            }
                                            form.clearErrors("phone")
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Admin Password</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!!loadingToast}
                                        type="password"
                                        placeholder="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <ImageUploader
                                        value={field.value}
                                        disabled={!!loadingToast}
                                        onLoading={setUploadingImage}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <SpinnerButton type="submit" icon={ConstructionIcon} isLoading={!!loadingToast || !!uploadingImage} text={"Start Setup"} />
                </div>
            </form>
        </Form>
    )
}
