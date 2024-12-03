import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toastType, useToast } from "@/components/ui/use-toast";
import ImageUploader from "@/components/ui/ImageUploader";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Upload } from "lucide-react";
import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { SaveAll } from "lucide-react";
import { api } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

export const SiteIdentityFormSchema = z.object({
    name1: z.string(),
    name2: z.string(),
    heroText: z.string(),
    logoPrimary: z.string(),
    logoAccent: z.string(),
    logoForeground: z.string(),
    linkedin: z.string(),
    instagram: z.string(),
    youtube: z.string(),
    facebook: z.string(),
})

export type SiteIdentityFormValues = z.infer<typeof SiteIdentityFormSchema>

export const SiteIdentityForm = ({ initialData }: {
    initialData?: SiteIdentityFormValues;
}) => {
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const { data: currentTier } = api.params.getCurrentTier.useQuery()
    const updateSiteIdentityMutation = api.siteIdentity.updateSiteIdentity.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: () => trpcUtils.siteIdentity.invalidate()
            .then(() => loadingToast?.update({
                id: loadingToast.id,
                title: "Success",
                description: `Update successfull`,
                variant: "success",
            })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    })

    const form = useForm<SiteIdentityFormValues>({
        resolver: zodResolver(SiteIdentityFormSchema),
        defaultValues: {
            facebook: initialData ? initialData.facebook : "",
            instagram: initialData ? initialData.instagram : "",
            linkedin: initialData ? initialData.linkedin : "",
            logoPrimary: initialData ? initialData.logoPrimary : "",
            logoAccent: initialData ? initialData.logoAccent : "",
            logoForeground: initialData ? initialData.logoForeground : "",
            name1: initialData ? initialData.name1 : "",
            name2: initialData ? initialData.name2 : "",
            heroText: initialData ? initialData.heroText : "",
            youtube: initialData ? initialData.youtube : "",
        },
    })

    const onSubmit = (data: SiteIdentityFormValues) => {
        updateSiteIdentityMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <fieldset disabled={!currentTier?.removeBranding} className="grid gap-4">
                    <Typography variant={"secondary"}>Site Name</Typography>
                    <Separator />
                    <div className="flex items-center gap-4 justify-between flex-wrap [&>*]:flex-grow">
                        <FormField
                            control={form.control}
                            name="name1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name 1</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="Megz"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logoPrimary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo Primary</FormLabel>
                                    <FormControl>
                                        <ImageUploader
                                            value={field.value}
                                            disabled={!!loadingToast}
                                            onChange={(url) => field.onChange(url)}
                                            onLoading={setUploadingImage}
                                            onRemove={() => field.onChange("")}
                                            noPadding
                                            customeButton={(
                                                <Upload className="w-4 h-4" />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logoForeground"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo Foreground</FormLabel>
                                    <FormControl>
                                        <ImageUploader
                                            value={field.value}
                                            disabled={!!loadingToast}
                                            onChange={(url) => field.onChange(url)}
                                            onLoading={setUploadingImage}
                                            onRemove={() => field.onChange("")}
                                            noPadding
                                            customeButton={(
                                                <Upload className="w-4 h-4" />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="logoAccent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo Accent</FormLabel>
                                    <FormControl>
                                        <ImageUploader
                                            value={field.value}
                                            disabled={!!loadingToast}
                                            onChange={(url) => field.onChange(url)}
                                            onLoading={setUploadingImage}
                                            onRemove={() => field.onChange("")}
                                            noPadding
                                            customeButton={(
                                                <Upload className="w-4 h-4" />
                                            )}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name 2</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="Learning"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="heroText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hero Section text</FormLabel>
                                <FormControl>
                                    <Textarea
                                        disabled={!!loadingToast}
                                        placeholder="Decribe what people do on your site"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Typography variant={"secondary"}>Social Links</Typography>
                    <Separator />
                    <div className="flex items-center gap-4 flex-wrap [&>*]:flex-grow">
                        <FormField
                            control={form.control}
                            name="facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook Page</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="https://www.facebook.com/bm.mohamed.magdi"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Instagram</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="https://www.instagram.com/"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="youtube"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Youtube</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="https://www.youtube.com/"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LinkedIn</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!!loadingToast}
                                            placeholder="https://www.linkedin.com/in/mohamed-magdy-fayed/"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Separator />
                    <div className="grid place-content-center">
                        <Button disabled={!!loadingToast || uploadingImage} type="submit">
                            <SaveAll className="w-4 h-4" />
                            <Typography>Submit</Typography>
                        </Button>
                    </div>
                </fieldset>
            </form>
        </Form>
    )
}