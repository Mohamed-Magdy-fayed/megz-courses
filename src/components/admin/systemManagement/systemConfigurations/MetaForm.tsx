import { AlertModal } from "@/components/general/modals/AlertModal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Separator } from "@/components/ui/separator";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Name can't be empty"),
    fbExchangeToken: z.string().min(1, "Please add the temporary access token"),
});

type MetaFormValues = z.infer<typeof formSchema>;

interface MetaFormProps {
    initialData?: MetaFormValues & { id: string, accessToken: string, name: string };
    disabled?: boolean;
}

export default function MetaForm({ initialData, disabled }: MetaFormProps) {
    const [isOpen, setIsOpen] = useState(false);

    const [loadingToast, setLoadingToast] = useState<toastType>();
    const trpcUtils = api.useUtils();
    const { toast } = useToast()

    const action = initialData ? "Update Token" : "Create";

    const defaultValues: MetaFormValues = initialData ? { ...initialData } : {
        name: "",
        fbExchangeToken: "",
    };

    const form = useForm<MetaFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const deleteAccountMutation = api.metaAccount.deleteMetaClient.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: () => trpcUtils.metaAccount.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `deleted successfully`,
                    variant: "success",
                })
                setIsOpen(false)
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
    const updateAccountMutation = api.metaAccount.updatePermenantAccessCode.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: ({ metaClient }) => trpcUtils.metaAccount.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Meta Client updated with name ${metaClient.name}`,
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
    const addAccountMutation = api.metaAccount.createPermenantAccessCode.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: ({ metaClient }) => trpcUtils.metaAccount.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Meta Client Created with name ${metaClient.name}`,
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

    const onSubmit = (data: MetaFormValues) => {
        if (!initialData) return addAccountMutation.mutate(data);
        updateAccountMutation.mutate({
            id: initialData.id,
            ...data
        })
    };

    return (
        <div>
            <AlertModal
                isOpen={isOpen}
                loading={!!loadingToast || !!disabled}
                onClose={() => setIsOpen(false)}
                onConfirm={() => {
                    if (!initialData) return
                    deleteAccountMutation.mutate({ id: initialData.id })
                }}
            />
            <ConceptTitle>Meta Webhook Config</ConceptTitle>
            <PaperContainer>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex w-full flex-col justify-between p-0 md:h-full"
                    >
                        <div className="scrollbar-thumb-rounded-lg flex flex-col gap-4 overflow-auto p-4 transition-all scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50">
                            {initialData && (
                                <Typography variant="secondary">
                                    Page Name: {initialData.name}
                                </Typography>
                            )}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={!!loadingToast || !!disabled}
                                                placeholder="Account Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fbExchangeToken"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Temporary Token</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={!!loadingToast || !!disabled}
                                                placeholder="EAAQUTFs..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {initialData?.accessToken && (
                                <div className="w-96 grid" >
                                    <Typography>Access Token</Typography>
                                    <div className="flex items-center gap-4">
                                        <code className="w-96 truncate relative rounded bg-foreground/10 px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                                            {initialData.accessToken}
                                        </code>
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(initialData.accessToken);
                                                toast({
                                                    variant: "info",
                                                    title: "Access token copied to clipboard"
                                                });
                                            }}
                                            variant={"icon"}
                                            customeColor={"mutedIcon"}
                                            type="button"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Separator></Separator>
                        <div className="flex p-4 justify-end items-center gap-4 h-full">
                            {!!initialData && (
                                <Button type="button" disabled={!!loadingToast || !!disabled} customeColor={"destructive"} onClick={() => {
                                    setIsOpen(true)
                                }}>
                                    Delete Client
                                </Button>
                            )}
                            <Button
                                disabled={!!loadingToast || !!disabled}
                                customeColor="accent"
                                type="reset"
                                onClick={() => form.reset()}
                            >
                                <Typography variant={"buttonText"}>Reset</Typography>
                            </Button>
                            <Button disabled={!!loadingToast || !!disabled} type="submit">
                                <Typography variant={"buttonText"}>{action}</Typography>
                            </Button>
                        </div>
                    </form>
                </Form>
            </PaperContainer>
        </div>
    );
};