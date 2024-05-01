import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader, Lock } from 'lucide-react'
import { FC, useState } from "react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Spinner from "@/components/Spinner";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const passwordFormSchema = z.object({
    oldPassword: z.string().nonempty("Please enter your old password"),
    newPassword: z.string().nonempty("Please add a new password"),
    newPasswordConfirmation: z.string().nonempty("Please confirm the new password"),
}).superRefine(({ oldPassword, newPassword, newPasswordConfirmation }, ctx) => {
    if (newPassword !== newPasswordConfirmation) ctx.addIssue({
        code: "custom",
        message: "Passwords don't match",
        path: ["newPasswordConfirmation"]
    })
    if (newPassword === oldPassword) ctx.addIssue({
        code: "custom",
        message: "Must use a different password",
        path: ["newPassword"]
    })
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>

const ChangePassword = () => {
    const [loading, setLoading] = useState(false)
    const session = useSession()

    const { toastError, toastSuccess } = useToast()

    const passwordDefaultValues: z.infer<typeof passwordFormSchema> = {
        oldPassword: "",
        newPassword: "",
        newPasswordConfirmation: "",
    };

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: passwordDefaultValues,
    });

    const changePasswordMutation = api.auth.changePassword.useMutation()

    const handlePasswordChange = ({ newPassword, newPasswordConfirmation, oldPassword }: PasswordFormValues) => {
        setLoading(true)
        changePasswordMutation.mutate({
            id: session.data?.user.id!,
            newPassword,
            newPasswordConfirmation,
            oldPassword,
        }, {
            onSuccess: () => toastSuccess("password changed successfull!"),
            onError: (e) => toastError(e.message),
            onSettled: () => setLoading(false),
        })
    }

    return (
        <Card className="col-span-12">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <Typography className="my-2" variant={'secondary'}>Change password</Typography>
                <Lock className="text-primary" />
            </CardHeader>
            <Form {...passwordForm}>
                <form
                    onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                    className="flex w-full flex-col justify-between p-0 md:h-full"
                >
                    <div className="p-4 flex flex-col gap-4">
                        <FormField
                            control={passwordForm.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem className="col-span-12 md:col-span-6 lg:col-span-4">
                                    <FormLabel>Old Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            disabled={loading}
                                            placeholder="Password"
                                            {...field}
                                            className="pl-8"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem className="">
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            disabled={loading}
                                            placeholder="Password"
                                            {...field}
                                            className="pl-8"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPasswordConfirmation"
                            render={({ field }) => (
                                <FormItem className="">
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            disabled={loading}
                                            placeholder="Password"
                                            {...field}
                                            className="pl-8"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <CardFooter className="p-4 grid place-content-center">
                            <Button disabled={loading} type="submit" className="relative">
                                {loading && <Spinner className="absolute w-6 h-6" />}
                                <Typography className={loading ? "opacity-0" : ""}>Change Password</Typography>
                            </Button>
                        </CardFooter>
                    </div>
                </form>
            </Form>
        </Card>
    )
}

export default ChangePassword
