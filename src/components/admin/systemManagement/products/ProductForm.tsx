import { ProductColumn } from "@/components/admin/systemManagement/products/ProductsColumn"
import { SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit3Icon, PlusSquare } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const productSchema = z.object({
    id: z.string(),
    active: z.boolean(),
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
    discountedPrice: z.number().optional(),
})

type FormValues = z.infer<typeof productSchema>

export default function ProductForm({ setIsOpen, initialData }: { initialData?: ProductColumn; setIsOpen: Dispatch<SetStateAction<boolean>>; }) {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            id: initialData?.id ?? "",
            active: initialData?.active === "Active" ? true : false,
            name: initialData?.name ?? "",
            price: initialData?.price ?? undefined,
            discountedPrice: initialData?.discountedPrice ?? undefined,
            description: initialData?.description ?? undefined,
        }
    })

    const trpcUtils = api.useUtils()
    const createMutation = api.products.create.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils: trpcUtils.products,
            loadingMessage: "Adding product...",
            successMessageFormatter: ({ product }) => {
                setIsOpen(false)
                return `New product ${product.name} Created`
            },
        })
    )
    const updateMutation = api.products.update.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils: trpcUtils.products,
            loadingMessage: "Updating product...",
            successMessageFormatter: ({ product }) => {
                setIsOpen(false)
                return `Product ${product.name} Updated`
            },
        })
    )

    const onSubmit = (data: FormValues) => {
        if (initialData) return updateMutation.mutate(data)
        createMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="p-2">
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="Package 1"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="p-2">
                            <FormLabel>Product Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={!!loadingToast}
                                    placeholder="Product Description"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex items-start justify-between gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="p-2">
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        disabled={!!loadingToast}
                                        placeholder="999.99"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                            <FormItem className="p-2">
                                <FormLabel>Discount Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        disabled={!!loadingToast}
                                        placeholder="999.99"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    />
                                </FormControl>
                                <FormDescription>Leave blank to use the main price only.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="p-2">
                            <FormControl>
                                <div className="flex items-center gap-4">
                                    <Switch
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={!!loadingToast}
                                        checked={field.value}
                                        onCheckedChange={(val) => field.onChange(val)}
                                    />
                                    <FormLabel>Is Active?</FormLabel>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <SpinnerButton icon={initialData ? Edit3Icon : PlusSquare} isLoading={!!loadingToast} text={initialData ? "Update" : "Create"} type="submit" />
                </div>
            </form>
        </Form>
    )
}
