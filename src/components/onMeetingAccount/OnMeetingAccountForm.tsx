import { SpinnerButton } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusSquareIcon } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const OnMeetingAccountFormSchema = z.object({
    name: z.string().min(1, "Please add a name"),
    email: z.string().min(1, "Please add your email"),
    password: z.string().min(1, "Please add your password"),
})

type OnMeetingAccountFormValues = z.infer<typeof OnMeetingAccountFormSchema>

const OnMeetingAccountForm = ({ setIsOpen }: { setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const form = useForm<OnMeetingAccountFormValues>({
        resolver: zodResolver(OnMeetingAccountFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        }
    })

    const trpcUtils = api.useUtils()
    const createKeysMutation = api.zoomAccounts.createOnMeetingKeys.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            successMessageFormatter: () => {
                setIsOpen(false)
                return "Account connected successfully!"
            },
            toast,
            trpcUtils,
        })
    )

    const handleCreateOnMeetingAccount = (data: OnMeetingAccountFormValues) => {
        createKeysMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateOnMeetingAccount)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="Name your account"
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
                        <FormItem className="p-4">
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
                    name="password"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="Your password"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <SpinnerButton icon={PlusSquareIcon} text="Add Account" isLoading={!!loadingToast} type="submit" />
                </div>
            </form>
        </Form>
    )
}

export default OnMeetingAccountForm