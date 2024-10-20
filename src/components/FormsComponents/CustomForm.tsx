import { useForm, useFieldArray, SubmitHandler, Control, FieldErrors } from "react-hook-form";
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
import ImageUploader from "../ui/ImageUploader";
import { Plus, Trash, Upload } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormTypes, MaterialItem } from "@prisma/client";
import { toastType, useToast } from "../ui/use-toast";
import Image from "next/image";
import { getInitials } from "@/lib/getInitials";

const QuestionSchema = z.object({
    fields: z.array(z.object({
        questionText: z.string(),
        points: z.number().min(1).max(5),
        type: z.enum(["multipleChoice", "trueFalse"]),
        image: z.string().optional().nullable(),
        options: z.array(z.object({
            isTrue: z.boolean().nullable(),
            text: z.string().nullable(),
            isCorrect: z.boolean()
        })).max(6).optional(),
        correctAnswer: z.boolean().optional(),
    }))
});

export interface IFormInput extends z.infer<typeof QuestionSchema> { }

const CustomForm: FC<{
    initialData?: EvaluationForm & {
        questions: EvaluationFormQuestion[],
        materialItem: MaterialItem | null,
    },
    setIsOpen?: Dispatch<SetStateAction<boolean>>,
}> = ({ initialData, setIsOpen }) => {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [levelId, setLevelId] = useState(initialData?.materialItem?.courseLevelId ? initialData.materialItem?.courseLevelId : undefined)
    const [materialId, setMaterialId] = useState(initialData?.materialItemId ? initialData.materialItemId : undefined)
    const [type, setType] = useState<EvaluationFormTypes | undefined>(initialData ? initialData.type : undefined)
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const defaultQuestion: IFormInput["fields"][number] = {
        type: "multipleChoice",
        questionText: "",
        points: 1,
        options: [
            { text: "", isTrue: null, isCorrect: false },
            { text: "", isTrue: null, isCorrect: false },
            { text: "", isTrue: null, isCorrect: false }
        ],
    }

    const methods = useForm<IFormInput>({
        resolver: zodResolver(QuestionSchema),
        defaultValues: {
            fields: initialData ? initialData.questions : [defaultQuestion]
        },
    });

    const { control, handleSubmit, watch, formState: { errors } } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "fields",
    });

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const { data: levelsData } = api.levels.getByCourseSlug.useQuery({ courseSlug }, { enabled: !!courseSlug })
    const { data: materialsData } = api.materials.getByCourseSlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug })
    const createEvalFormMutation = api.evaluationForm.createEvalForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: ({ evaluationForm }) => trpcUtils.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Evaluation form total points ${evaluationForm.totalPoints}`,
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
        },
    })

    const editEvalFormMutation = api.evaluationForm.editEvalForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 30000,
            variant: "info",
        })),
        onSuccess: ({ evaluationForm }) => trpcUtils.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Evaluation form total points ${evaluationForm.totalPoints}`,
                    variant: "success",
                })
                setIsOpen?.(false)
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

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        if (!type || !materialId) return toast({
            title: "Error",
            description: "Missing form type or material item",
            duration: 3000,
            variant: "destructive"
        })
        if (!initialData) return createEvalFormMutation.mutate({
            fields: data.fields.map(field => field.type === "trueFalse" ? ({
                ...field,
                options: [{ text: null, isTrue: true, isCorrect: !!field.correctAnswer }, { text: null, isTrue: false, isCorrect: !field.correctAnswer }]
            }) : field),
            materialId,
            type,
        })
        editEvalFormMutation.mutate({
            fields: data.fields.map(field => field.type === "trueFalse" ? ({
                ...field,
                options: [{ text: null, isTrue: true, isCorrect: !!field.correctAnswer }, { text: null, isTrue: false, isCorrect: !field.correctAnswer }]
            }) : field),
            id: initialData.id,
        })
    };

    return (
        <Form {...methods} >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
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
                {fields.map(({ id }, i) => {
                    const questionType = watch(`fields.${i}.type`);
                    const imageUrl = watch(`fields.${i}.image`);
                    return (
                        <div key={id} className="space-y-2">
                            <div className="flex gap-2 justify-between flex-col items-start">
                                <FormField
                                    control={control}
                                    name={`fields.${i}.type`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value: IFormInput["fields"][number]["type"]) => field.onChange(value)}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
                                                        <SelectItem value="trueFalse">True/False</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            {errors.fields && errors.fields[i]?.type &&
                                                <FormMessage>
                                                    This field is required
                                                </FormMessage>
                                            }
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center gap-2 w-full">
                                    {imageUrl
                                        ? <Image className="max-h-40 w-auto m-auto" src={imageUrl} alt={getInitials(fields[i]?.questionText)} height={100} width={100} />
                                        : null
                                    }
                                    <FormField
                                        control={control}
                                        name={`fields.${i}.image`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Image</FormLabel>
                                                <FormControl>
                                                    <ImageUploader
                                                        noPadding
                                                        value={!field.value ? "" : field.value}
                                                        disabled={!!loadingToast?.id}
                                                        onChange={(url) => {
                                                            field.onChange(url)

                                                        }}
                                                        onLoading={setUploadingImage}
                                                        onRemove={() => field.onChange("")}
                                                        customeButton={(
                                                            <Upload className="w-4 h-4" />
                                                        )}
                                                        customeImage={<></>}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`fields.${i}.points`}
                                        render={({ field }) => (
                                            <FormItem className="ml-auto">
                                                <FormLabel>Points</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(e) => field.onChange(parseInt(e))}
                                                        value={field.value.toString()}
                                                    >
                                                        <SelectTrigger className="w-fit">
                                                            <SelectValue placeholder="Select points" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[...Array(5).keys()].map((point) => (
                                                                <SelectItem key={point + 1} value={(point + 1).toString()}>
                                                                    {point + 1}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                {errors.fields && errors.fields[i]?.points &&
                                                    <FormMessage>
                                                        This field is required
                                                    </FormMessage>
                                                }
                                            </FormItem>
                                        )}
                                    />
                                    <FormItem className="flex flex-col items-center">
                                        <FormLabel className="p-1">Remove</FormLabel>
                                        <Button
                                            type="button"
                                            variant={"outline"}
                                            customeColor={"destructiveOutlined"}
                                            onClick={() => remove(i)}>
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </FormItem>
                                </div>
                            </div>
                            <FormField
                                control={control}
                                name={`fields.${i}.questionText`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question {i + 1}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage>
                                            {errors.fields && errors.fields[i]?.questionText?.message
                                                && <span>{errors.fields![i]?.questionText?.message}</span>
                                            }
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />

                            {questionType === "multipleChoice" && (
                                <MultipleChoiceOptions index={i} control={control} errors={errors} />
                            )}

                            {questionType === "trueFalse" && (
                                <FormField
                                    control={control}
                                    name={`fields.${i}.correctAnswer`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correct Answer</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    onValueChange={(val) => field.onChange(val === "true" ? true : false)}
                                                    value={field.value ? "true" : "false"}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Is true or false" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={"true"}>True</SelectItem>
                                                        <SelectItem value={"false"}>False</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            {errors.fields && errors.fields[i]?.correctAnswer &&
                                                <FormMessage>
                                                    This field is required
                                                </FormMessage>
                                            }
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )
                })}
                <div className="flex flex-col gap-4 md:items-end">
                    <Button type="button" onClick={() => append(defaultQuestion)}>
                        <Plus className="w-4 h-4" />
                        Add Question
                    </Button>
                    <Button disabled={!!loadingToast?.id || uploadingImage} customeColor={"success"} type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    );
};

const MultipleChoiceOptions: React.FC<{ control: Control<IFormInput, any>, errors: FieldErrors<IFormInput>, index: number }> = ({ control, errors, index }) => {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: `fields.${index}.options`,
    });

    return (
        <div className=" flex flex-col gap-4 md:flex-wrap md:flex-row">
            {fields.map((option, i) => {
                return (
                    <div
                        className="flex items-center gap-2 justify-between"
                        key={option.id}
                    >
                        <FormField
                            control={control}
                            name={`fields.${index}.options.${i}.text`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Option {i + 1}</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value || ""} />
                                    </FormControl>
                                    {errors.fields && errors.fields[index]?.options?.[i]?.text &&
                                        <FormMessage>
                                            This field is required
                                        </FormMessage>
                                    }
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-2">
                            <FormField
                                control={control}
                                name={`fields.${index}.options.${i}.isCorrect`}
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Button
                                                type="button"
                                                tabIndex={-1}
                                                variant={"icon"}
                                                customeColor={field.value ? "successIcon" : "destructiveIcon"}
                                                onClick={() => {
                                                    fields.map(fel => {
                                                        console.log(fel);

                                                        fel.isCorrect === true && update(i, { isCorrect: false, isTrue: fel.isTrue, text: fel.text })
                                                    })
                                                    field.onChange(!field.value)
                                                }}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </Button>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button tabIndex={-1} type="button" variant={"icon"} customeColor={"destructiveIcon"} onClick={() => remove(i)}>
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )
            })}
            <div className="py-4">
                {fields.length < 6 && (
                    <Button className="w-fit" type="button" onClick={() => append({ text: "", isTrue: null, isCorrect: false })}>Add Option</Button>
                )}
            </div>
        </div>
    );
};

export default CustomForm;
