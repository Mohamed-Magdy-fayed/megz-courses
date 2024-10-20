import { Lead } from "@/components/leads/LeadsColumn"
import { Button, SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import MobileNumberInput from "@/components/ui/phone-number-input"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, PlusSquare } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const LeadsForm = ({ setIsOpen, initialData }: { initialData?: Pick<Lead, "id" | "name" | "email" | "phone">, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
        }
    })

    const trpcUtils = api.useUtils()
    const addLeadMutation = api.leads.createLead.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Adding lead...",
            successMessageFormatter: ({ lead }) => {
                setIsOpen(false)
                return `${lead.source} Lead Created`
            },
        })
    )

    const editLeadMutation = api.leads.editLead.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Updating lead...",
            successMessageFormatter: () => {
                setIsOpen(false)
                return `Lead Contact Information Updated!`
            },
        })
    )

    const onSubmit = (data: FormValues) => {
        if (initialData) return editLeadMutation.mutate({ ...data, id: initialData.id })
        addLeadMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="Jon Doe"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="example@mail.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <MobileNumberInput
                                    placeholder="01100110011"
                                    setValue={(val) => field.onChange(val)}
                                    value={field.value}
                                    onError={(isError) => {
                                        form.clearErrors("phone")
                                        if (isError) {
                                            form.setError("phone", { message: "Not a valid number!" })
                                            return
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 justify-end">
                    <Button type="button" children={"Cancel"} onClick={() => setIsOpen(false)} customeColor={"destructive"} />
                    <SpinnerButton icon={initialData ? Edit : PlusSquare} isLoading={!!loadingToast} text={initialData ? "Edit Lead" : "Add Lead"} type="submit" />
                </div>
            </form>
        </Form>
    )
}

export default LeadsForm