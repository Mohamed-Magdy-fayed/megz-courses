import Spinner from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/Typoghraphy"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusSquare } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

export const ZoomAccountFormSchema = z.object({
    name: z.string().min(1, "Please add a name"),
})

type ZoomAccountFormValues = z.infer<typeof ZoomAccountFormSchema>

const ZoomAccountForm = ({ setIsOpen }: { setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { toastError, toast, toastInfo } = useToast()

    const [loading, setLoading] = useState(false)

    const form = useForm<ZoomAccountFormValues>({
        resolver: zodResolver(ZoomAccountFormSchema),
        defaultValues: {
            name: "",
        }
    })

    const createAuthCodeMutation = api.zoomAccounts.createAuthCode.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ zoomAuthUrl }) => {
            toast({
                title: "Please authorize your zoom account in the new tab!",
                description: "once the authorization is completed check this page again to see your added account!"
            })
            window.open(zoomAuthUrl, '_blank')
        },
        onError: ({ message }) => toastError(message),
        onSettled: () => {
            setLoading(false)
            setIsOpen(false)
        },
    })

    const handleCreateZoomAccount = (data: ZoomAccountFormValues) => {
        console.log(data);
        createAuthCodeMutation.mutate(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateZoomAccount)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={loading}
                                    placeholder="example@mail.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        <PlusSquare className={cn("w-4 h-4", loading && "opacity-0")} />
                        <Typography className={cn(loading && "opacity-0")}>Add Account</Typography>
                        <Spinner className={cn("absolute w-4 h-4 opacity-0", loading && "opacity-100")} />
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default ZoomAccountForm