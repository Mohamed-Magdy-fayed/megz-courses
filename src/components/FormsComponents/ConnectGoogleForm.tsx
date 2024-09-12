import { useForm } from "react-hook-form";
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
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormTypes, MaterialItem } from "@prisma/client";
import { toastType, useToast } from "@/components/ui/use-toast";

const GoogleFormSchema = z.object({
    url: z.string(),
});

export interface GoogleFormValues extends z.infer<typeof GoogleFormSchema> { }

const ConnectGoogleForm: FC<{
    initialData?: EvaluationForm & {
        questions: EvaluationFormQuestion[],
        materialItem: MaterialItem | null,
    }
    setIsOpen: Dispatch<SetStateAction<boolean>>
}> = ({ initialData, setIsOpen }) => {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;

    useEffect(() => {
        if (initialData) {
            setMaterialId(initialData.materialItemId || "")
            setType(initialData.type)
        }
    }, [initialData])

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [levelId, setLevelId] = useState(initialData?.materialItem?.courseLevelId ? initialData.materialItem.courseLevelId : undefined)
    const [materialId, setMaterialId] = useState(initialData?.materialItemId ? initialData.materialItemId : undefined)
    const [type, setType] = useState<EvaluationFormTypes | undefined>(initialData ? initialData.type : undefined)

    const defaultValues: GoogleFormValues = {
        url: initialData?.externalLink || "",
    }

    const form = useForm<GoogleFormValues>({
        resolver: zodResolver(GoogleFormSchema),
        defaultValues,
    });

    const { toast } = useToast()
    const trpcUtils = api.useContext()
    const { data: levelsData } = api.levels.getByCourseSlug.useQuery({ courseSlug }, { enabled: !!courseSlug })
    const { data: materialsData } = api.materials.getByCourseSlug.useQuery({ slug: courseSlug })
    const createGoogleEvalFormMutation = api.evaluationForm.createGoogleEvalForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 3000,
            variant: "info",
        })),
        onSuccess: () => trpcUtils.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Connected with google form successfully`,
                    duration: 2000,
                    variant: "success",
                })
            }),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            duration: 2000,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    })
    const editGoogleEvalFormMutation = api.evaluationForm.editGoogleEvalForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 3000,
            variant: "info",
        })),
        onSuccess: () => trpcUtils.courses.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Google form updated successfully`,
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

    const onSubmit = ({ url }: GoogleFormValues) => {
        if (!type || !materialId) return
        if (initialData) return editGoogleEvalFormMutation.mutate({ id: initialData.id, url })
        createGoogleEvalFormMutation.mutate({ materialId, type, url })
    };

    return (
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <div className="flex flex-col gap-2">
                    <Select
                        disabled={!!initialData}
                        value={levelId}
                        onValueChange={(val) => setLevelId(val)}
                    >
                        <SelectTrigger className="xl:w-fit">
                            <SelectValue placeholder="Select Level"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {levelsData?.levels.map(item => (
                                <SelectItem
                                    key={item.id}
                                    value={item.id}
                                >
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-4">
                        <Select
                            disabled={!levelId || !!initialData}
                            value={materialId}
                            onValueChange={(val) => setMaterialId(val)}
                        >
                            <SelectTrigger className="xl:w-fit">
                                <SelectValue placeholder="Select Material item"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {materialsData?.materialItems.filter(item => item.courseLevelId === levelId).map(item => (
                                    <SelectItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={item.evaluationForms.some(({ type }) => type === "assignment")
                                            && item.evaluationForms.some(({ type }) => type === "quiz")}
                                    >
                                        {item.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            disabled={!materialId || !!initialData}
                            value={type}
                            onValueChange={(val) => setType(val === EvaluationFormTypes.assignment
                                ? EvaluationFormTypes.assignment
                                : EvaluationFormTypes.quiz)
                            }
                        >
                            <SelectTrigger className="xl:w-fit">
                                <SelectValue placeholder="Assignment or Quiz?"></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    disabled={materialsData?.materialItems
                                        .find(({ id }) => id === materialId)?.evaluationForms
                                        .some(({ type }) => type === "assignment")}
                                    value={EvaluationFormTypes.assignment}
                                >
                                    Assignemnt
                                </SelectItem>
                                <SelectItem
                                    disabled={materialsData?.materialItems
                                        .find(({ id }) => id === materialId)?.evaluationForms
                                        .some(({ type }) => type === "quiz")}
                                    value={EvaluationFormTypes.quiz}
                                >
                                    Quiz
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                <div className="flex flex-col gap-4 md:items-end">
                    <Button disabled={!!loadingToast?.id} customeColor={"success"} type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    );
};

export default ConnectGoogleForm;
