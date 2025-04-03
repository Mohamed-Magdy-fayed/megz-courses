import { useForm, useFieldArray, SubmitHandler, Control, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ImageUploader from "@/components/ui/ImageUploader";
import { Plus, Trash, Upload } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { Prisma, QuestionChoiceType, SystemFormTypes } from "@prisma/client";
import { toastType, useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { getInitials } from "@/lib/getInitials";
import { validItemQuestionTypes, validItemTypes, validQuestionChoiceTypes, validSystemFormTypes } from "@/lib/enumsTypes";
import { createMutationOptions } from "@/lib/mutationsHelper";
import SingleSelectField from "@/components/general/selectFields/SingleSelectField";
import { upperFirst } from "lodash";
import SystemFormCardPreview from "@/components/admin/systemManagement/systemForms/PreviewComponents/SystemFormCardPreview";
import { Separator } from "@/components/ui/separator";

const CustomFormSchema = z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(z.object({
        type: z.enum(validItemTypes),
        title: z.string(),
        imageUrl: z.string().optional(),
        questions: z.array(z.object({
            questionText: z.string(),
            required: z.boolean(),
            shuffle: z.boolean(),
            points: z.number(),
            type: z.enum(validItemQuestionTypes),
            choiceType: z.enum(validQuestionChoiceTypes),
            options: z.array(z.object({
                value: z.string(),
                isCorrect: z.boolean(),
            })),
        }))
    }))
});

export interface IFormInput extends z.infer<typeof CustomFormSchema> { }

const CustomForm: FC<{
    initialData?: Prisma.SystemFormGetPayload<{ include: { materialItem: true, items: { include: { questions: { include: { options: true } } } } } }>,
    setIsOpen?: Dispatch<SetStateAction<boolean>>
}> = ({ initialData, setIsOpen }) => {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [levelId, setLevelId] = useState(initialData?.courseLevelId ? initialData?.courseLevelId : undefined)
    const [materialId, setMaterialId] = useState(initialData?.materialItemId ? initialData?.materialItemId : undefined)
    const [type, setType] = useState<SystemFormTypes | undefined>(initialData ? initialData.type : undefined)
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);

    const defaultItem: IFormInput["items"][number] = {
        type: "QuestionItem",
        title: "",
        imageUrl: "",
        questions: [{
            questionText: "",
            type: "Choice",
            choiceType: "Radio",
            points: 1,
            required: true,
            shuffle: true,
            options: [
                { isCorrect: true, value: "" },
                { isCorrect: false, value: "" },
                { isCorrect: false, value: "" },
            ],
        }],

    }

    const methods = useForm<IFormInput>({
        resolver: zodResolver(CustomFormSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            items: initialData ? initialData.items.map(item => ({
                ...item,
                questions: item.questions.map(q => ({ ...q, shuffle: q.shuffle ?? false, choiceType: q.choiceType ?? undefined })),
                title: item.title ?? "",
                imageUrl: item.imageUrl ?? "",
                videoUrl: item.videoUrl ?? "",
            })) : [defaultItem]
        },
    });

    const { control, handleSubmit, watch, formState: { errors } } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const { data: courseData } = api.courses.getBySlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug })
    const createSystemFormMutation = api.systemForms.createSystemForm.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ systemForm }) => {
                return `${systemForm.type} form Created with total points ${systemForm.totalScore}`
            },
        })
    )

    const editSystemFormMutation = api.systemForms.editSystemForm.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ updatedSystemForm }) => {
                setIsOpen?.(false)
                return `${updatedSystemForm.type} form update with total points ${updatedSystemForm.totalScore}`
            },
        })
    )

    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        const formattedItems = data.items.map(item => ({
            ...item,
            questions: item.type !== "QuestionGroupItem" && item.type !== "QuestionItem" ? [] : item.questions.map(question => ({
                ...question,
                choiceType: question.options.filter(op => op.isCorrect).length > 1 ? QuestionChoiceType.Checkbox : QuestionChoiceType.Radio,
                required: question.points > 0,
            }))
        }))

        if (!type) return toast({
            title: "Error",
            description: "Missing form type",
            duration: 3000,
            variant: "destructive"
        })

        if (!initialData) return createSystemFormMutation.mutate({
            title: data.title,
            description: data.description,
            courseSlug: type === "PlacementTest" ? courseSlug : undefined,
            levelId: type === "FinalTest" ? levelId : undefined,
            materialId: (type === "Quiz" || type === "Assignment") ? materialId : undefined,
            items: formattedItems,
            type,
        })
        editSystemFormMutation.mutate({
            id: initialData.id,
            title: data.title,
            description: data.description,
            items: formattedItems,
        })
    };

    return (
        <div className="grid grid-cols-2 gap-12">
            <Form {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className={"flex items-center gap-4 xl:justify-start"}>
                        <SingleSelectField
                            title={"Form Type"}
                            placeholder={"Select Form Type"}
                            isLoading={!!loadingToast}
                            selected={type}
                            setSelected={setType}
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
                        {type !== "PlacementTest" && type !== undefined && (
                            <SingleSelectField
                                title={"Level"}
                                placeholder={"Select Course Level"}
                                isLoading={!!loadingToast}
                                selected={levelId}
                                setSelected={setLevelId}
                                data={courseData?.course?.levels.map(level => ({
                                    Active: !((type === "FinalTest" && level.systemForms.some(form => form.type === type))
                                        || ((type === "Assignment" || type === "Quiz") && level.materialItems.every(item => item.systemForms.some(form => form.type === type)))),
                                    label: level.name,
                                    value: level.id,
                                })) || []}
                            />
                        )}
                        {levelId && (type === "Assignment" || type === "Quiz") && (
                            <SingleSelectField
                                title={"Session"}
                                placeholder={"Select Session"}
                                isLoading={!!loadingToast}
                                selected={materialId}
                                setSelected={setMaterialId}
                                data={courseData?.course?.levels.find(lvl => lvl.id === levelId)?.materialItems.map(item => ({
                                    Active: !item.systemForms.some(form => form.type === type),
                                    label: item.title,
                                    value: item.id,
                                })) || []}
                            />
                        )}
                    </div>
                    <FormField
                        control={control}
                        name={`title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Form Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>
                                    {errors.title?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage>
                                    {errors.description?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                    <Separator />
                    {fields.map(({ id }, i) => {
                        const itemType = watch(`items.${i}.type`);
                        const imageUrl = watch(`items.${i}.imageUrl`);

                        return (
                            <div key={id}>
                                <div className="flex gap-2 justify-between flex-col items-start">
                                    <FormField
                                        control={control}
                                        name={`items.${i}.type`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <FormControl>
                                                    <SingleSelectField
                                                        title={"Type"}
                                                        placeholder={"Select type"}
                                                        isLoading={!!loadingToast}
                                                        selected={field.value}
                                                        setSelected={(val) => {
                                                            methods.setValue(`items.${i}.questions`, (val === "QuestionItem" || val === "QuestionGroupItem") ? [...defaultItem.questions] : [])
                                                            field.onChange(val)
                                                        }}
                                                        data={validItemTypes.filter(t => t !== "QuestionGroupItem" && t !== "VideoItem").map(type => ({
                                                            label: type,
                                                            value: type,
                                                        }))}
                                                    />
                                                </FormControl>
                                                {errors.items && errors.items[i]?.type &&
                                                    <FormMessage>
                                                        This field is required
                                                    </FormMessage>
                                                }
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`items.${i}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage>
                                                    {errors.title?.message}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex items-center gap-2 w-full">
                                        {(itemType === "ImageItem" || itemType === "QuestionGroupItem" || itemType === "QuestionItem" || itemType === "TextItem") && (
                                            <>
                                                {imageUrl
                                                    ? <Image className="max-h-40 w-auto m-auto" src={imageUrl} alt={getInitials(fields[i]?.title)} height={100} width={100} />
                                                    : null
                                                }
                                                <FormField
                                                    control={control}
                                                    name={`items.${i}.imageUrl`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Image</FormLabel>
                                                            <FormControl>
                                                                <ImageUploader
                                                                    noPadding
                                                                    value={!field.value ? "" : field.value}
                                                                    disabled={!!loadingToast?.id}
                                                                    onLoading={setUploadingImage}
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
                                                {itemType !== "ImageItem" && (
                                                    <FormField
                                                        control={control}
                                                        name={`items.${i}.questions.0.points`}
                                                        render={({ field }) => (
                                                            <FormItem className="ml-auto">
                                                                <FormLabel>Points</FormLabel>
                                                                <FormControl>
                                                                    <SingleSelectField
                                                                        title={"Points"}
                                                                        placeholder={"Select points"}
                                                                        isLoading={!!loadingToast}
                                                                        selected={field.value}
                                                                        setSelected={(val) => field.onChange(val)}
                                                                        data={[...Array(6).keys()].map(point => ({
                                                                            label: point === 0 ? "Not required!" : (point).toString(),
                                                                            value: point,
                                                                        }))}
                                                                    />
                                                                </FormControl>
                                                                {errors.items && errors.items[i]?.questions?.[0]?.points &&
                                                                    <FormMessage>
                                                                        This field is required
                                                                    </FormMessage>
                                                                }
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </>
                                        )}
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

                                {(itemType === "QuestionItem" || itemType === "QuestionGroupItem") && (
                                    <MultipleChoiceOptions index={i} control={control} errors={errors} />
                                )}

                                <Separator className="my-4" />
                            </div>
                        )
                    })}
                    <div className="flex flex-col gap-4 md:items-end">
                        <Button type="button" onClick={() => append(defaultItem)}>
                            <Plus className="w-4 h-4" />
                            Add Item
                        </Button>
                        <Button
                            customeColor={"success"}
                            type="submit"
                            disabled={!!loadingToast?.id || uploadingImage}
                        >Submit</Button>
                    </div>
                </form>
            </Form>
            <SystemFormCardPreview
                formData={methods.watch()}
            />
        </div>
    );
};

const MultipleChoiceOptions: React.FC<{
    control: Control<IFormInput, any>,
    errors: FieldErrors<IFormInput>,
    index: number,
}> = ({ control, errors, index }) => {
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: `items.${index}.questions.0.options`,
    });

    return (
        <div>
            <FormField
                control={control}
                name={`items.${index}.questions.0.questionText`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage>
                            {errors.title?.message}
                        </FormMessage>
                    </FormItem>
                )}
            />
            <div className=" flex flex-col gap-4 md:flex-wrap md:flex-row">
                {fields.map((option, i) => {
                    return (
                        <div
                            className="flex items-center gap-2 justify-between"
                            key={option.id}
                        >
                            <FormField
                                control={control}
                                name={`items.${index}.questions.0.options.${i}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Option {i + 1}</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ""} />
                                        </FormControl>
                                        {errors.items && errors.items[index]?.questions?.[0]?.options?.[i]?.value &&
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
                                    name={`items.${index}.questions.0.options.${i}.isCorrect`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl>
                                                <Button
                                                    type="button"
                                                    tabIndex={-1}
                                                    variant={"icon"}
                                                    customeColor={field.value ? "successIcon" : "destructiveIcon"}
                                                    onClick={() => {
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
                        <Button className="w-fit" type="button" onClick={() => append({ value: "", isCorrect: false })}>Add Option</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomForm;
