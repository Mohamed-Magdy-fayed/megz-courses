import { api } from "@/lib/api";
import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/button";
import useFileUpload from "@/hooks/useFileUpload";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import SelectField from "@/components/salesOperation/SelectField";
import { MaterialsRow } from "@/components/contentComponents/materials/MaterialsColumn";

const formSchema = z.object({
    title: z.string().min(1, "Title can't be empty"),
    subTitle: z.string().min(1, "Please add a sub title"),
    slug: z.string().min(1, "Please add a slug").regex(/^\S*$/, "No spaces allowed"),
    uploads: z.array(z.string()),
    files: z.array(z.custom<File>((file) => file instanceof File, { message: "please upload at least one file!" })),
});

export type UploadsFormValues = z.infer<typeof formSchema>;

export type UploadStatus = { state: "Idle" | "Working", progress: number }

const UploadMaterialForm = ({ initialData, setIsOpen }: { initialData?: MaterialsRow, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const router = useRouter();
    const courseSlug = router.query.courseSlug as string;

    const { data: courseLevelsData } = api.levels.getByCourseSlug.useQuery({ courseSlug }, { enabled: !!courseSlug })

    const [loading, setLoading] = useState(false);
    const [levelSlug, setLevelSlug] = useState<string[]>(initialData ? [initialData.levelSlug] : []);

    const form = useForm<UploadsFormValues>({
        defaultValues: initialData
            ? {
                title: initialData.title,
                subTitle: initialData.subTitle || "",
                slug: initialData.slug || "",
                files: [],
                uploads: initialData.uploads || [],
            }
            : {
                title: "",
                subTitle: "",
                slug: "",
                files: [],
                uploads: [],
            }
    });

    const uploadMaterialMutation = api.materials.uploadMaterialItem.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ materialItem }) =>
            trpcUtils.courses.invalidate().then(() => {
                toastSuccess(`Your new material (${materialItem.title}) is ready!`)
                setIsOpen(false)
            }),
        onError: ({ message }) => toastError(message),
        onSettled: () => setLoading(false),
    });

    const editUploadMaterialMutation = api.materials.editUploadMaterialItem.useMutation({
        onSuccess: ({ materialItem }) =>
            trpcUtils.courses.invalidate().then(() => {
                toastSuccess(`Your new material (${materialItem.title}) is updated!`)
                setIsOpen(false)
            }),
        onError: ({ message }) => toastError(message),
        onSettled: () => setLoading(false),
    });
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast();
    const { progress, uploadFiles } = useFileUpload();

    const handleSubmit = async ({ files, slug, subTitle, title }: UploadsFormValues) => {
        if (!files) return toastError("no files selected")
        if (title === "") return toastError("please enter a title")
        if (!levelSlug[0]) return toastError("Please select a level")
        if (initialData) return editUploadMaterialMutation.mutate({ id: initialData.id, title, subTitle, slug, levelSlug: levelSlug[0] })

        setLoading(true)
        const uploads = await uploadFiles(files, `uploads/content/courses/${courseSlug}/${levelSlug}/${slug}`) || []
        uploadMaterialMutation.mutateAsync({ title, subTitle, uploads, slug, levelSlug: levelSlug[0] });
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="py-2">
                <FormItem className="p-4">
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                        <SelectField
                            values={levelSlug}
                            setValues={setLevelSlug}
                            listTitle="Level"
                            placeholder="Select Level"
                            data={courseLevelsData?.levels.map(lvl => ({
                                active: true,
                                label: lvl.name,
                                value: lvl.slug,
                            })) || []}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Material Title</FormLabel>
                            <FormControl>
                                <Input disabled={loading} placeholder="Session 1" {...field} />
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
                                <Input disabled={loading} placeholder="Present Simple" {...field} />
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
                                <Input disabled={loading} placeholder="session_1 (no spaces)" {...field} />
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
                                        disabled={loading}
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
                <LoadingButton progress={progress} disabled={loading} type="submit">Submit</LoadingButton>
            </form>
        </Form>
    );
};

export default UploadMaterialForm;
