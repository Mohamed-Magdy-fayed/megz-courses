import { ProductItemColumn } from "@/components/admin/systemManagement/products/productItems/ProductItemColumn"
import SingleSelectLevel from "@/components/general/selectFields/SingleSelectLevel"
import SingleSelectCourse from "@/components/general/selectFields/SingleSelectCourse"
import { SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit3Icon, PlusSquare } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const productItemSchema = z.object({
    id: z.string(),
    productId: z.string(),
    courseId: z.string(),
    levelId: z.string(),
})

type FormValues = z.infer<typeof productItemSchema>
type ProductItemFormProps =
    | { productId: string; initialData?: never; setIsOpen: Dispatch<SetStateAction<boolean>> }
    | { initialData: ProductItemColumn; productId?: never; setIsOpen: Dispatch<SetStateAction<boolean>> };


export default function ProductItemForm({ productId, setIsOpen, initialData }: ProductItemFormProps) {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(productItemSchema),
        defaultValues: {
            id: initialData?.id ?? "",
            productId: initialData?.productId ?? productId,
            courseId: initialData?.courseId ?? "",
            levelId: initialData?.levelId ?? "",
        }
    })

    const trpcUtils = api.useUtils()
    const createMutation = api.productItems.create.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils: trpcUtils.productItems,
            loadingMessage: "Adding product item...",
            successMessageFormatter: () => {
                setIsOpen(false)
                return `New product item Created`
            },
        })
    )
    const updateMutation = api.productItems.update.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils: trpcUtils.productItems,
            loadingMessage: "Updating product item...",
            successMessageFormatter: () => {
                setIsOpen(false)
                return `Product item Updated`
            },
        })
    )

    const onSubmit = (data: FormValues) => {
        if (initialData) return updateMutation.mutate(data)
        createMutation.mutate(data)
    }

    const courseId = form.watch("courseId")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end justify-between gap-4">
                <div className="flex flex-col items-start">
                    <FormField
                        control={form.control}
                        name="courseId"
                        render={({ field }) => (
                            <FormItem className="p-2">
                                <FormLabel>Course</FormLabel>
                                <FormControl>
                                    <SingleSelectCourse
                                        courseId={field.value}
                                        setCourseId={field.onChange}
                                        loading={!!loadingToast}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="levelId"
                        render={({ field }) => (
                            <FormItem className="p-2">
                                <FormLabel>Level</FormLabel>
                                <FormControl>
                                    <SingleSelectLevel
                                        courseId={courseId}
                                        levelId={field.value}
                                        setLevelId={field.onChange}
                                        loading={!!loadingToast}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                    <SpinnerButton icon={initialData ? Edit3Icon : PlusSquare} isLoading={!!loadingToast} text={initialData ? "Update" : "Create"} type="submit" />
                </div>
            </form>
        </Form>
    )
}
