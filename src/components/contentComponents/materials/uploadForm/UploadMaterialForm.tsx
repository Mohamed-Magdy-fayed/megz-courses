import { api } from "@/lib/api";
import { Dispatch, SetStateAction, useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import useFileUpload from "@/hooks/useFileUpload";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MaterialsRow } from "@/components/contentComponents/materials/MaterialsColumn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMutationOptions } from "@/lib/mutationsHelper";

const formSchema = z.object({
    title: z.string().min(1, "Title can't be empty"),
    subTitle: z.string(),
    levelSlug: z.string().min(1, "Please select a level!"),
    slug: z.string().min(1, "Please add a slug").regex(/^\S*$/, "No spaces allowed"),
    uploads: z.array(z.string()),
    files: z.array(z.custom<File>((file) => file instanceof File, { message: "please upload at least one file!" })),
});

export type UploadsFormValues = z.infer<typeof formSchema>;

const UploadMaterialForm = ({ initialData, setIsOpen }: { initialData?: MaterialsRow, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const router = useRouter();
    const courseSlug = router.query.courseSlug as string;

    const { data: courseLevelsData } = api.levels.getByCourseSlug.useQuery({ courseSlug }, { enabled: !!courseSlug })

    const [loadingToast, setLoadingToast] = useState<toastType>();

    const form = useForm<UploadsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                title: initialData.title,
                subTitle: initialData.subTitle || "",
                levelSlug: initialData.levelSlug,
                slug: initialData.slug || "",
                files: [],
                uploads: initialData.uploads || [],
            }
            : {
                title: "",
                subTitle: "",
                levelSlug: undefined,
                slug: "",
                files: [],
                uploads: [],
            }
    });

    const trpcUtils = api.useUtils();
    const { toast, toastError } = useToast();
    const checkMaterialMutation = api.materials.checkMaterialItem.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ exists }) => {
                if (exists) {
                    return `material item with same slug already exists!`
                }

                const { files, levelSlug, title, slug, subTitle } = form.getValues()

                uploadFiles(files, `uploads/content/courses/${courseSlug}/${levelSlug}/${slug}`).then((data) => {
                    uploadMaterialMutation.mutateAsync({ title, subTitle, uploads: data, slug, levelSlug });
                }) || []

                return ""
            },
        })
    )

    const uploadMaterialMutation = api.materials.uploadMaterialItem.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ materialItem }) => `Your new material (${materialItem.title}) is ready!`,
        })
    )

    const editUploadMaterialMutation = api.materials.editUploadMaterialItem.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ materialItem }) => `Your new material (${materialItem.title}) is updated!`,
        })
    )

    const { uploadFiles } = useFileUpload();

    const handleSubmit = async ({ files, slug, subTitle, title, levelSlug }: UploadsFormValues) => {
        if (!files) return toastError("no files selected")
        if (title === "") return toastError("please enter a title")
        if (!levelSlug[0]) return toastError("Please select a level")

        if (initialData) return editUploadMaterialMutation.mutate({ id: initialData.id, title, subTitle, slug, levelSlug })

        checkMaterialMutation.mutate({ slug })
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="py-2">
                <FormField
                    control={form.control}
                    name="levelSlug"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Level</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={(value: string) => field.onChange(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseLevelsData?.levels.map(lvl => (
                                            <SelectItem key={lvl.id} value={lvl.slug}>{lvl.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Material Title</FormLabel>
                            <FormControl>
                                <Input disabled={!!loadingToast} placeholder="Session 1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="subTitle"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Material Sub Title</FormLabel>
                            <FormControl>
                                <Input disabled={!!loadingToast} placeholder="Present Simple" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>URL Slug</FormLabel>
                            <FormControl>
                                <Input disabled={!!loadingToast} placeholder="session_1 (no spaces)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!initialData && (
                    <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => (
                            <FormItem className="p-4">
                                <FormLabel>Select Files</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!!loadingToast}
                                        type="file"
                                        multiple
                                        placeholder="Upload Material"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                field.onChange([...e.target.files]);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <div className="p-4">
                    <Button disabled={!!loadingToast} type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    );
};

export default UploadMaterialForm;
