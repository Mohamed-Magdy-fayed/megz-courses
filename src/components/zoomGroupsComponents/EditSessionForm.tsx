import SingleSelectField from "@/components/SingleSelectField"
import { SpinnerButton } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/DatePicker"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { validSessionStatuses } from "@/lib/enumsTypes"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { ZoomSession } from "@prisma/client"
import { CheckSquareIcon, PlusSquare } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    id: z.string(),
    sessionDate: z.date(),
    meetingNumber: z.string(),
    meetingPassword: z.string(),
    sessionStatus: z.enum(validSessionStatuses),
})

type FormValues = z.infer<typeof formSchema>

const EditSessionForm = ({ setIsOpen, initialData }: { setIsOpen: Dispatch<SetStateAction<boolean>>, initialData?: Partial<ZoomSession> }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? initialData : {
            id: "",
            sessionDate: new Date(),
            meetingNumber: "",
            meetingPassword: "",
            sessionStatus: "Scheduled"
        }
    })

    const trpcUtils = api.useUtils()
    const editSessionMutation = api.zoomSessions.editSession.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Updating...",
            successMessageFormatter: () => {
                setIsOpen(false)
                return `Session updated`
            },
        })
    )

    const onSubmit = (data: FormValues) => {
        editSessionMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-2">
                <FormField
                    control={form.control}
                    name="meetingNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meeting Number</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="meetingPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meeting Password</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sessionDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Session Time</FormLabel>
                            <FormControl>
                                <DatePicker
                                    date={field.value}
                                    setDate={(val) => field.onChange(val)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sessionStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                                <SingleSelectField
                                    title="Status"
                                    placeholder={"Select a status"}
                                    isLoading={!!loadingToast}
                                    data={validSessionStatuses.map(status => ({
                                        label: status,
                                        value: status,
                                    }))}
                                    selected={field.value}
                                    setSelected={(val) => field.onChange(val)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <SpinnerButton icon={CheckSquareIcon} isLoading={!!loadingToast} text="Confirm" type="submit" />
                </div>
            </form>
        </Form>
    )
}

export default EditSessionForm