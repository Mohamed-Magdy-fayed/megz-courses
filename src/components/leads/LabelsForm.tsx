import { Button, ButtonProps, SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { rest } from "lodash"
import { PlusSquare } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    value: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const LabelsForm = ({ leadId }: { leadId: string }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
        }
    })

    const inputRef = useRef<HTMLInputElement>(null)

    const trpcUtils = api.useUtils()
    const { data, refetch } = api.leadLabels.searchLeadLabels.useQuery({ value: form.getValues().value }, { enabled: form.getValues().value.length > 0 })
    const addLabelMutation = api.leadLabels.createLeadLabel.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Adding label...",
            successMessageFormatter: ({ leadLabel }) => `${leadLabel.value} label Created`,
            disableToast: true,
        })
    )
    const connectLabelMutation = api.leadLabels.connectLeadLabel.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Connecting label...",
            successMessageFormatter: ({ leadLabel }) => `${leadLabel.value} label Connected`,
            disableToast: true,
        })
    )

    const onSubmit = (data: FormValues) => {
        addLabelMutation.mutate({
            leadId,
            value: data.value
        })
    }

    useDebounce(() => {
        if (form.watch("value").length === 0) return
        refetch()
    }, 1000, [form.watch("value")])

    const handleSelectSuggestion = (labelId: string) => {
        connectLabelMutation.mutate({ labelId, leadId })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Add a label</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    autoComplete="off"
                                    placeholder="Search or create a label"
                                    {...field}
                                    ref={inputRef}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="hidden">
                    <SpinnerButton icon={PlusSquare} isLoading={!!loadingToast} text={"Add Label"} type="submit" />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {data?.leadLabels.map(label => (
                        <Button key={label.id} customeColor={"infoIcon"} onClick={() => handleSelectSuggestion(label.id)} type="button">
                            {label.value}
                        </Button>
                    ))}
                </div>
            </form>
        </Form>
    )
}

export default LabelsForm