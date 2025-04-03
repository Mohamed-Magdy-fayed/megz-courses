import SingleSelectField from "@/components/general/selectFields/SingleSelectField";
import { SpinnerButton } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { validSystemFormTypes } from "@/lib/enumsTypes";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { upperFirst } from "lodash";
import { DownloadCloud, LucideProps } from "lucide-react";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const GoogleFormSchema = z.object({
    id: z.string(),
    clientId: z.string().optional(),
    formUrl: z.string(),
    materialId: z.string().optional(),
    levelId: z.string().optional(),
    courseSlug: z.string().optional(),
    type: z.enum(validSystemFormTypes),
});

export type GoogleFormInput = z.infer<typeof GoogleFormSchema>

export default function GoogleFormImporter({ initialData, setIsOpen }: {
    initialData?: Prisma.SystemFormGetPayload<{ include: { materialItem: true, items: { include: { questions: { include: { options: true } } } } } }>,
    setIsOpen?: Dispatch<SetStateAction<boolean>>
}) {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;

    const defaultValues: GoogleFormInput = {
        id: initialData?.id || "",
        clientId: initialData?.googleClientId ?? undefined,
        formUrl: initialData?.googleFormUrl || "",
        type: initialData?.type || "Assignment",
        courseSlug,
        levelId: initialData?.courseLevelId ?? undefined,
        materialId: initialData?.materialItemId ?? undefined,
    }

    const form = useForm<GoogleFormInput>({
        resolver: zodResolver(GoogleFormSchema),
        defaultValues,
    });

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const { data: courseData } = api.courses.getBySlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug })
    const { data: googleClientsData } = api.googleAccounts.getGoogleAccounts.useQuery(undefined, { enabled: !!courseSlug })
    const createGoogleFormMutation = api.systemForms.createGoogleForm.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ googleForm }) => {
                return `${googleForm.type} form Created with total points ${googleForm.totalScore}`
            },
        })
    )

    const editGoogleFormMutation = api.systemForms.editGoogleForm.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ updatedGoogleForm }) => {
                setIsOpen?.(false)
                return `${updatedGoogleForm.type} form update with total points ${updatedGoogleForm.totalScore}`
            },
        })
    )

    const onSubmit = ({ clientId, formUrl, id, type, courseSlug, levelId, materialId }: GoogleFormInput) => {
        if (!type) return toast({
            title: "Error",
            description: "Missing form type",
            duration: 3000,
            variant: "destructive"
        })
        if (!clientId) return toast({
            title: "Error",
            description: "Please select google client!",
            duration: 3000,
            variant: "destructive"
        })
        if (!formUrl) return toast({
            title: "Error",
            description: "Please enter the form URL!",
            duration: 3000,
            variant: "destructive"
        })

        if (!initialData) return createGoogleFormMutation.mutate({
            type,
            clientId,
            formUrl,
            courseSlug,
            levelId,
            materialId,
        })
        editGoogleFormMutation.mutate({
            id,
            clientId,
            formUrl,
        })
    };

    const type = form.watch("type")
    const levelId = form.watch("levelId")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className={"flex items-center gap-4 xl:justify-start"}>
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Form Title</FormLabel>
                                <FormControl>
                                    <SingleSelectField
                                        title={"Form Type"}
                                        placeholder={"Select Form Type"}
                                        isLoading={!!loadingToast}
                                        selected={field.value}
                                        setSelected={(val) => field.onChange(val)}
                                        data={validSystemFormTypes.map(typeName => ({
                                            Active: !(
                                                (typeName === "PlacementTest" && courseData?.course?.systemForms.some(form => form.type === typeName))
                                                || (typeName === "FinalTest" && courseData?.course?.levels.every(lvl => lvl.systemForms.some(form => form.type === typeName)))
                                                || ((typeName === "Assignment" || typeName === "Quiz") && courseData?.course?.levels.every(lvl => lvl.materialItems.every(item => item.systemForms.some(form => form.type === typeName))))
                                            ),
                                            label: upperFirst(typeName),
                                            value: typeName,
                                        }))}
                                    />
                                </FormControl>
                                <FormMessage>
                                    {form.formState.errors.type?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                    />

                    {type !== "PlacementTest" && type !== undefined && (
                        <FormField
                            control={form.control}
                            name="levelId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Level</FormLabel>
                                    <FormControl>
                                        <SingleSelectField
                                            title={"Level"}
                                            placeholder={"Select Course Level"}
                                            isLoading={!!loadingToast}
                                            selected={field.value}
                                            setSelected={(val) => field.onChange(val)}
                                            data={courseData?.course?.levels.map(level => ({
                                                Active: !((type === "FinalTest" && level.systemForms.some(form => form.type === type))
                                                    || ((type === "Assignment" || type === "Quiz") && level.materialItems.every(item => item.systemForms.some(form => form.type === type)))),
                                                label: level.name,
                                                value: level.id,
                                            })) || []}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {form.formState.errors.levelId?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                    )}
                    {levelId && (type === "Assignment" || type === "Quiz") && (
                        <FormField
                            control={form.control}
                            name="materialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Session</FormLabel>
                                    <FormControl>
                                        <SingleSelectField
                                            title={"Session"}
                                            placeholder={"Select Session"}
                                            isLoading={!!loadingToast}
                                            selected={field.value}
                                            setSelected={(val) => field.onChange(val)}
                                            data={courseData?.course?.levels.find(lvl => lvl.id === levelId)?.materialItems.map(item => ({
                                                Active: !item.systemForms.some(form => form.type === type),
                                                label: item.title,
                                                value: item.id,
                                            })) || []}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {form.formState.errors.materialId?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                    )}
                </div>
                <FormField
                    control={form.control}
                    name="formUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Form URL</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="https://docs.google.com/forms/d/{{ID}}/edit" type="text" />
                            </FormControl>
                            <FormMessage>
                                {form.formState.errors.formUrl?.message}
                            </FormMessage>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Google Account</FormLabel>
                            <FormControl>
                                <SingleSelectField
                                    title={"Google Account"}
                                    placeholder={"Select the form owner google account"}
                                    isLoading={!!loadingToast}
                                    selected={field.value}
                                    setSelected={(val) => field.onChange(val)}
                                    data={googleClientsData?.googleAccounts.map(account => ({
                                        label: account.name,
                                        value: account.id,
                                    })) || []}
                                />
                            </FormControl>
                            <FormMessage>
                                {form.formState.errors.clientId?.message}
                            </FormMessage>
                        </FormItem>
                    )}
                />
                <div>
                    <SpinnerButton text="Import" isLoading={!!loadingToast} icon={DownloadCloud} />
                </div>
            </form>
        </Form>
    )
}
