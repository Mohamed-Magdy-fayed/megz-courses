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
import { FC, useState } from "react";
import ImageUploader from "../ui/ImageUploader";
import { Plus, Trash, Upload } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormTypes } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import Image from "next/image";
import { getInitials } from "@/lib/getInitials";

const QuestionSchema = z.object({
    fields: z.array(z.object({
        question: z.string(),
        points: z.number().min(1).max(5),
        type: z.enum(["multipleChoice", "trueFalse"]),
        image: z.string().optional().nullable(),
        options: z.array(z.object({
            isTrue: z.boolean().nullable(),
            text: z.string().nullable(),
            isCorrect: z.boolean()
        })).max(6).optional(),
        trueOrFalse: z.boolean().optional(),
    }))
});

export interface IFormInput extends z.infer<typeof QuestionSchema> { }

const CustomForm: FC<{ initialData?: EvaluationForm & { questions: EvaluationFormQuestion[] } }> = ({ initialData }) => {
    const router = useRouter();
    const courseId = router.query?.id as string;

    const [isLoading, setIsLoading] = useState(false)
    const [materialId, setMaterialId] = useState(initialData?.materialItemId ? initialData.materialItemId : "")
    const [type, setType] = useState<EvaluationFormTypes>(initialData ? initialData.type : "assignment")

    const defaultQuestion: IFormInput["fields"][number] = {
        type: "multipleChoice",
        question: "",
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

    const { toastSuccess, toastError } = useToast()
    const { data: materialsData } = api.materials.getByCourseId.useQuery({ courseId })
    const createEvalFormMutation = api.evaluationForm.createEvalForm.useMutation({
        onMutate: () => setIsLoading(true),
        onSuccess: ({ evaluationForm }) => toastSuccess(`Evaluation form total points ${evaluationForm.totalPoints}`),
        onError: ({ message }) => toastError(message),
        onSettled: () => setIsLoading(false),
    })

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        createEvalFormMutation.mutate({
            fields: data.fields.map(field => field.type === "trueFalse" ? ({
                ...field,
                options: [{ text: null, isTrue: true, isCorrect: !!field.trueOrFalse }, { text: null, isTrue: false, isCorrect: !field.trueOrFalse }]
            }) : field),
            materialId,
            type,
        })
    };

    return (
        <Form {...methods} >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
                <div className="flex items-center gap-4 xl:justify-start">
                    <Select onValueChange={(val) => setMaterialId(val)}>
                        <SelectTrigger className="xl:w-fit">
                            <SelectValue placeholder="Select Material item"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {materialsData?.materialItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        onValueChange={(val) => setType(val === EvaluationFormTypes.assignment
                            ? EvaluationFormTypes.assignment
                            : EvaluationFormTypes.quiz)}
                    >
                        <SelectTrigger className="xl:w-fit">
                            <SelectValue placeholder="Assignment or Quiz?"></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={EvaluationFormTypes.assignment}>Assignemnt</SelectItem>
                            <SelectItem value={EvaluationFormTypes.quiz}>Quiz</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {fields.map(({ id }, i) => {
                    const questionType = watch(`fields.${i}.type`);
                    const imageUrl = watch(`fields.${i}.image`);
                    return (
                        <div key={id}>
                            <div className="flex items-center gap-2 justify-between">
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
                                <div className="flex items-center gap-2">
                                    {imageUrl
                                        ? <Image className="max-h-40 w-auto m-auto" src={imageUrl} alt={getInitials(fields[i]?.question)} height={100} width={100} />
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
                                                        disabled={isLoading}
                                                        onChange={(url) => {
                                                            field.onChange(url)

                                                        }}
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
                                            <FormItem>
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
                                        <FormLabel>Remove</FormLabel>
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
                                name={`fields.${i}.question`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question {i + 1}</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage>
                                            {errors.fields && errors.fields[i]?.question?.message
                                                && <span>{errors.fields![i]?.question?.message}</span>
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
                                    name={`fields.${i}.trueOrFalse`}
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
                                            {errors.fields && errors.fields[i]?.trueOrFalse &&
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
                    <Button customeColor={"success"} type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    );
};

const MultipleChoiceOptions: React.FC<{ control: Control<IFormInput, any>, errors: FieldErrors<IFormInput>, index: number }> = ({ control, errors, index }) => {
    const { fields, append, remove } = useFieldArray({
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
                                                onClick={() => field.onChange(!field.value)}
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
