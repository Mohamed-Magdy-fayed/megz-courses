import { SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusSquare } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    name: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const TemplateForm = ({ setIsOpen }: { setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        }
    })

    const trpcUtils = api.useUtils()
    const addLeadMutation = api.leadStages.createLeadStage.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Adding lead...",
            successMessageFormatter: ({ leadStage }) => {
                setIsOpen(false)
                return `New stage ${leadStage.name} Created`
            },
        })
    )

    const handleCreate = (data: FormValues) => {
        addLeadMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="p-4">
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
                <div className="flex justify-end">
                    <SpinnerButton icon={PlusSquare} isLoading={!!loadingToast} text="Add Account" type="submit" />
                </div>
            </form>
        </Form>
    )
}

export default TemplateForm