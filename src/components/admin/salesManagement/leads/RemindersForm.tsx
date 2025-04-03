import { Button, ButtonProps, SpinnerButton } from "@/components/ui/button"
import Calendar from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimePicker } from "@/components/ui/TimePicker"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Reminder } from "@prisma/client"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { format } from "date-fns"
import { rest } from "lodash"
import { CalendarIcon, Save } from "lucide-react"
import { PlusSquare } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const formSchema = z.object({
    title: z.string(),
    time: z.date().optional(),
})

type FormValues = z.infer<typeof formSchema>

const RemindersForm = ({ leadId, initialData, setIsOpen }: { leadId: string, initialData?: Reminder, setIsOpen: (val: boolean) => void }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            time: initialData?.time
        }
    })

    const trpcUtils = api.useUtils()
    const addReminderMutation = api.leads.addReminder.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Adding...",
            successMessageFormatter: ({ updatedLead }) => {
                setIsOpen(false)
                return `Reminder set to ${format(updatedLead.reminders[updatedLead.reminders.length - 1]?.time!, "PPPp")}`
            }
        })
    )

    const onSubmit = ({ title, time }: FormValues) => {
        if (!time) return toast({ variant: "destructive", title: "Error", description: "please select a time!" })
        addReminderMutation.mutate({ id: leadId, title, time })
    }

    const timeWatch = form.watch("time")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    autoComplete="off"
                                    placeholder="Title"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-start">
                            <FormLabel>Select Time</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            className={cn(
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPPp")
                                            ) : (
                                                "Pick a date"
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(val) => field.onChange(val)}
                                            disabled={(val) => {
                                                const nowDate = new Date()
                                                return val < nowDate && val.getDate() !== nowDate.getDate()
                                            }
                                            }
                                            initialFocus
                                        />
                                        <TimePicker date={field.value} setDate={(val) => field.onChange(val)} />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 justify-end">
                    <Button type="button" children={"Cancel"} onClick={() => setIsOpen(false)} customeColor={"destructive"} />
                    <SpinnerButton type="submit" text="Save Reminder" icon={Save} isLoading={!!loadingToast} disabled={(!form.watch("time") || (!!timeWatch && timeWatch.getTime() < new Date().getTime())) || form.getValues().title.length === 0} />
                </div>
            </form>
        </Form>
    )
}

export default RemindersForm