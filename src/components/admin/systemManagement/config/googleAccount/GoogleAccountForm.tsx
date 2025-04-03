import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { PlusSquare } from "lucide-react";
import { Typography } from "@/components/ui/Typoghraphy";
import { cn } from "@/lib/utils";

export const GoogleAccountFormSchema = z.object({
    name: z.string().min(1, "Please add a name"),
});

type GoogleAccountFormValues = z.infer<typeof GoogleAccountFormSchema>;

const GoogleAccountForm = ({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { toastError, toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<GoogleAccountFormValues>({
        resolver: zodResolver(GoogleAccountFormSchema),
        defaultValues: { name: "" },
    });

    const createAuthCodeMutation = api.googleAccounts.createAuthCode.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ googleAuthUrl }) => {
            toast({
                title: "Please authorize your Google account in the new tab!",
                description: "Once the authorization is Completed, check this page again to see your added account!",
            });
            window.open(googleAuthUrl, "_blank");
        },
        onError: ({ message }) => toastError(message),
        onSettled: () => {
            setLoading(false);
            setIsOpen(false);
        },
    });

    const handleCreateGoogleAccount = (data: GoogleAccountFormValues) => {
        createAuthCodeMutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateGoogleAccount)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="example@mail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        <PlusSquare className={cn("w-4 h-4", loading && "opacity-0")} />
                        <Typography className={cn(loading && "opacity-0")}>Add Account</Typography>
                        <Spinner className={cn("absolute w-4 h-4 opacity-0", loading && "opacity-100")} />
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default GoogleAccountForm;
