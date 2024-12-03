import { Button, ButtonProps, SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { LeadNote } from "@prisma/client"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { rest } from "lodash"
import { PlusSquare, Trash, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    value: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const NotesForm = ({ leadId, initialData, setIsOpen }: { leadId: string, initialData?: Partial<LeadNote>, setIsOpen?: (val: string) => void }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: initialData?.value || "",
        }
    })

    const trpcUtils = api.useUtils()
    const addNoteMutation = api.leadNotes.createLeadNote.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Adding label...",
            successMessageFormatter: () => {
                form.reset()
                return ""
            },
        })
    )
    const editNoteMutation = api.leadNotes.editLeadNote.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Updating label...",
            successMessageFormatter: () => {
                setIsOpen?.("")
                return ``
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
                return ``
            },
            disableToast: true,
        })
    )

    const onSubmit = (data: FormValues) => {
        if (initialData?.id) return editNoteMutation.mutate({
            id: initialData.id,
            value: data.value
        })
        addNoteMutation.mutate({
            leadId,
            value: data.value
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
                    name="value"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Record your notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    disabled={!!loadingToast}
                                    autoComplete="off"
                                    placeholder="Write a note..."
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

export default NotesForm