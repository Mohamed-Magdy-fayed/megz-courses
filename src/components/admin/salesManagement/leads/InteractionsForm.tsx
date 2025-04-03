import SingleSelectField from "@/components/general/selectFields/SingleSelectField"
import { SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { validLeadInteractionsType } from "@/lib/enumsTypes"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { LeadInteraction } from "@prisma/client"
import { PlusSquare, SendIcon, Trash, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    description: z.string(),
    type: z.enum(validLeadInteractionsType).optional(),
})

type FormValues = z.infer<typeof formSchema>

const InteractionsForm = ({ leadId, initialData, setIsOpen }: { leadId: string, initialData?: Partial<LeadInteraction>, setIsOpen?: (val: string) => void }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: initialData?.description || "",
            type: initialData?.type || "Chat",
        }
    })

    const trpcUtils = api.useUtils()
    const addInteractionMutation = api.leadInteractions.createLeadInteraction.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Recording Interaction...",
            successMessageFormatter: ({ leadInteraction }) => {
                form.reset()
                return `${leadInteraction.type} interaction recorded`
            },
        })
    )
    const editInteractionMutation = api.leadInteractions.editLeadInteraction.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Updating Interaction...",
            successMessageFormatter: ({ updatedLeadInteraction }) => {
                setIsOpen?.("")
                return `${updatedLeadInteraction.type} interaction updated!`
            },
        })
    )
    const deleteNoteMutation = api.leadNotes.deleteLeadNotes.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: () => {
                return `lead interaction deleted`
            },
        })
    )

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            e.key === ""
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    const onSubmit = ({ description, type }: FormValues) => {
        if (!type) return toast({ title: "Error", description: "Please select interaction type!", variant: "destructive" })

        if (initialData?.id) return editInteractionMutation.mutate({
            id: initialData.id,
            description,
            type,
        })
        addInteractionMutation.mutate({
            leadId,
            description,
            type,
        })
    }

    const handleDelete = () => {
        if (initialData?.id) return deleteNoteMutation.mutate([initialData.id])
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Interaction Type</FormLabel>
                            <FormControl>
                                <SingleSelectField
                                    placeholder="Select Interaction Type"
                                    data={validLeadInteractionsType.map(t => ({
                                        Active: true,
                                        label: t,
                                        value: t,
                                    }))}
                                    isLoading={!!loadingToast}
                                    selected={field.value}
                                    setSelected={(val) => {
                                        field.onChange(val)
                                    }}
                                    title="Interaction Type"
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
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Descripe your Interactions</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={!!loadingToast}
                                    autoComplete="off"
                                    placeholder="Interaction description..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 justify-end">
                    {initialData && setIsOpen && (
                        <>
                            <SpinnerButton customeColor={"destructiveIcon"} onClick={() => setIsOpen("")} icon={XIcon} isLoading={!!loadingToast} text={"Cancel"} type="button" />
                            <SpinnerButton customeColor={"destructive"} onClick={handleDelete} icon={Trash} isLoading={!!loadingToast} text={"Delete"} type="button" />
                        </>
                    )}
                    <SpinnerButton icon={PlusSquare} isLoading={!!loadingToast} text={"Save"} type="submit" />
                </div>
            </form>
        </Form>
    )
}

export default InteractionsForm