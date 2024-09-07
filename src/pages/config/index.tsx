import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { ApiAlert } from "@/components/ui/api-alert";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowRightFromLineIcon, Copy, PlusSquare } from "lucide-react";
import type { NextPage } from "next";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Modal from "@/components/ui/modal";
import { useEffect, useState } from "react";
import ZoomAccountForm from "@/components/zoomAccount/ZoomAccountForm";
import { PaperContainer } from "@/components/ui/PaperContainers";
import ZoomAccountsClient from "@/components/zoomAccount/ZoomAccountsClient";
import { useRouter } from "next/router";
import { SiteIdentityForm } from "@/components/siteIdentity/SiteIdentityForm";
import { api } from "@/lib/api";
import { env } from "@/env.mjs";
import { z } from "zod";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/AlertModal";

const tabs = [
    { value: "site_identity", label: "Site Identity" },
    { value: "zoom_accounts", label: "Zoom Accounts" },
    // { value: "facebook", label: "Facebook Configuration" },
    { value: "sales_channels", label: "Sales Channels" },
]

const ConfigPage: NextPage = () => {
    const router = useRouter();

    const [isZoomOpen, setIsZoomOpen] = useState(false)

    const { data, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })

    useEffect(() => { refetch() }, [])
    const { data: metaClient } = api.metaAccount.getMetaClient.useQuery()

    return (
        <AppLayout>
            <Modal
                description=""
                title="Add a zoom account"
                isOpen={isZoomOpen}
                onClose={() => setIsZoomOpen(false)}
                children={(
                    <ZoomAccountForm setIsOpen={setIsZoomOpen} />
                )}
            />
            <Tabs className="w-full" id="config" defaultValue={"site_identity"}>
                <TabsList className="w-full">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="zoom_accounts">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Zoom Accounts</ConceptTitle>
                            <Button onClick={() => setIsZoomOpen(true)} >
                                <PlusSquare className="w-4 h-4 mr-2" />
                                Add an account
                            </Button>
                        </div>
                        <PaperContainer>
                            <ZoomAccountsClient />
                        </PaperContainer>
                    </div>
                </TabsContent>
                <TabsContent value="site_identity">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between w-full">
                            <ConceptTitle>Site Identity</ConceptTitle>
                        </div>
                        <PaperContainer>
                            {
                                data?.siteIdentity && <SiteIdentityForm initialData={data.siteIdentity} />
                            }
                        </PaperContainer>
                    </div>
                </TabsContent>
                <TabsContent value="sales_channels">
                    <ConceptTitle>Sales Channels</ConceptTitle>
                    <ApiAlert title="webhook callback url (for Facebook - Instagram - WhatsApp)" description={`${env.NEXT_PUBLIC_NEXTAUTH_URL}api/facebook`} />
                    <div className="flex items-center justify-between p-4">
                        <Typography>once verified successfully your potintial customers will be added to your database</Typography>
                        <Link href={`/database`}>
                            <Button className="whitespace-nowrap space-x-2" customeColor={"primaryOutlined"} variant={"outline"}>
                                <Typography variant={"buttonText"}>Go to Database</Typography>
                                <ArrowRightFromLineIcon></ArrowRightFromLineIcon>
                            </Button>
                        </Link>
                    </div>
                    <FacebookForm initialData={metaClient?.metaClient ? {
                        accessToken: metaClient.metaClient.accessToken,
                        fbExchangeToken: "",
                        id: metaClient.metaClient.id,
                        name: metaClient.metaClient.name,
                    } : undefined} />
                </TabsContent>
            </Tabs>
        </AppLayout>
    )
}

export default ConfigPage

const formSchema = z.object({
    name: z.string().min(1, "Name can't be empty"),
    fbExchangeToken: z.string().min(1, "Please add the temporary access token"),
});

type FacebookFormValues = z.infer<typeof formSchema>;

interface FacebookFormProps {
    initialData?: FacebookFormValues & { id: string, accessToken: string };
}
const FacebookForm: React.FC<FacebookFormProps> = ({ initialData }) => {
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [isOpen, setIsOpen] = useState(false);

    const { toast } = useToast()

    const action = initialData ? "Update Token" : "Create";

    const defaultValues: FacebookFormValues = initialData ? initialData : {
        name: "",
        fbExchangeToken: "",
    };

    const form = useForm<FacebookFormValues>({
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
                    description: `Meta Client created with name ${metaClient.name}`,
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
    const trpcUtils = api.useContext();

    const onSubmit = (data: FacebookFormValues) => {
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
                loading={!!loadingToast}
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
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={!!loadingToast}
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
                                                disabled={!!loadingToast}
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
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Separator></Separator>
                        <div className="flex p-4 justify-end items-center gap-4 h-full">
                            {!!initialData && (
                                <Button type="button" customeColor={"destructive"} onClick={() => {
                                    setIsOpen(true)
                                }}>
                                    Delete Client
                                </Button>
                            )}
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
            </PaperContainer>
        </div>
    );
};