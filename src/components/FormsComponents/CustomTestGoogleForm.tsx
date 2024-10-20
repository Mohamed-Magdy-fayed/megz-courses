import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormTypes, GoogleForm, GoogleFormQuestion, MaterialItem } from "@prisma/client";
import { toastType, useToast } from "../ui/use-toast";
import SelectField from "@/components/salesOperation/SelectField";
import NormalSelectField from "@/components/salesOperation/NormalSelectField";

const TestGoogleFormSchema = z.object({
    url: z.string(),
    clientId: z.string(),
});

export interface TestGoogleFormValues extends z.infer<typeof TestGoogleFormSchema> { }

const CustomTestGoogleForm: FC<{
    initialData?: EvaluationForm & {
        questions: EvaluationFormQuestion[];
        materialItem: MaterialItem | null;
        googleForm?: GoogleForm & {
            googleFormQuestions: GoogleFormQuestion[]
        } | null;
    }
    setIsOpen: Dispatch<SetStateAction<boolean>>
}> = ({ initialData, setIsOpen }) => {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [levelId, setLevelId] = useState<string[]>(initialData?.materialItem?.courseLevelId ? [initialData.materialItem?.courseLevelId] : [])
    const [type, setType] = useState<EvaluationFormTypes | undefined>(initialData ? initialData.type : undefined)

    const defaultValues: TestGoogleFormValues = {
        url: initialData?.googleFormUrl || "",
        clientId: initialData?.googleForm?.googleClientId || "",
    }

    const form = useForm<TestGoogleFormValues>({
        resolver: zodResolver(TestGoogleFormSchema),
        defaultValues,
    });

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const { data: googleAccountsData } = api.googleAccounts.getGoogleAccounts.useQuery()
    const { data: courseData } = api.courses.getBySlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug })
    const { data: levelsData } = api.levels.getByCourseSlug.useQuery({ courseSlug }, { enabled: !!courseSlug })
    const createTestEvalGoogleFormMutation = api.evaluationForm.createTestEvalGoogleForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: () => trpcUtils.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Connected with google form successfully`,
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
        },
    })

    const editTestEvalFormMutation = api.evaluationForm.editGoogleEvalForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: () => trpcUtils.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Connected with google form successfully`,
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
        },
    })

    const onSubmit: SubmitHandler<TestGoogleFormValues> = ({ url, clientId }) => {
        if (!type) return toast({
            title: "Error",
            description: "Please select test type",
            variant: "destructive",
        })
        if (initialData) return editTestEvalFormMutation.mutate({ id: initialData.id, url, clientId })
        createTestEvalGoogleFormMutation.mutate({ type, slug: courseSlug, url, clientId, levelId: levelId[0] })
    };

    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <div className={"flex items-center gap-4 xl:justify-start"}>
                    <Select
                        value={type}
                        onValueChange={(val) => setType(val === EvaluationFormTypes.finalTest
                            ? EvaluationFormTypes.finalTest
                            : EvaluationFormTypes.placementTest)
                        }
                    >
                        <SelectTrigger className="xl:w-fit">
                            <SelectValue placeholder="Final or Placement test?"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                disabled={courseData?.course?.evaluationForms
                                    .filter(({ type }) => type === "finalTest")
                                    .length === levelsData?.levels.length
                                }
                                value={EvaluationFormTypes.finalTest}
                            >
                                Final Test
                            </SelectItem>
                            <SelectItem
                                disabled={courseData?.course?.evaluationForms
                                    .some(({ type }) => type === "placementTest")}
                                value={EvaluationFormTypes.placementTest}
                            >
                                Placement Test
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {type === "finalTest" && (
                        <SelectField
                            values={levelId}
                            setValues={setLevelId}
                            placeholder="Select Course Level"
                            listTitle="Level"
                            data={levelsData?.levels.map(level => ({
                                active: !courseData?.course?.evaluationForms.some(({ type, courseLevelId }) => type === "finalTest" && courseLevelId === level.id),
                                label: level.name,
                                value: level.id,
                            })) || []}
                        />
                    )}
                </div>
                <FormField
                    control={form.control}
                    name={`url`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Form URL</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`clientId`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Google Account</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value || undefined}
                                    onValueChange={(val) => field.onChange(val)}
                                >
                                    <SelectTrigger className="xl:w-fit">
                                        <SelectValue placeholder="Select Google Account"></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {googleAccountsData?.googleAccounts.map(account => (
                                            <SelectItem
                                                key={account.id}
                                                value={account.id}
                                            >
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col gap-4 md:items-end">
                    <Button disabled={!!loadingToast?.id} customeColor={"success"} type="submit">Submit</Button>
                </div>
            </form>
        </Form >
    );
};

export default CustomTestGoogleForm;
