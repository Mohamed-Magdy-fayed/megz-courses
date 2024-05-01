import { api } from "@/lib/api";
import { Lock } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import Spinner from "../Spinner";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useRouter } from "next/router";
import { render } from "@react-email/render";
import ResetPasswordEmail from "../emails/ResetPasswordEmail";

export const resetPasswordFormSchema = z.object({
    email: z.string().email().optional(),
    code: z.string().optional(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

type ResetPasswordFormProps = {
    setOpen: Dispatch<SetStateAction<boolean>>
}

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ setOpen }) => {
    const [passwordForm, setPasswordForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toastError, toastSuccess } = useToast()
    const router = useRouter()

    const defaultValues: ResetPasswordFormValues = {
        email: "",
        code: "",
        password: "",
        passwordConfirmation: "",
    }

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues,
    });

    const resetPasswordRequestMutation = api.auth.resetPasswordRequest.useMutation();
    const resetPasswordEmailMutation = api.auth.resetPasswordEmail.useMutation();
    const resetPasswordWithCodeMutation = api.auth.resetPasswordWithCode.useMutation();

    const handleResetPassword = async ({ email, code, password, passwordConfirmation }: ResetPasswordFormValues) => {
        if (!email) {
            return toastError("please enter your email");
        }

        if (passwordForm) {
            if (!code) return toastError("Please provide security code from your email!")
            if (!password) return toastError("Please add a new password!")
            if (password !== passwordConfirmation) return toastError("Passwords don't match")
            setLoading(true);
            return resetPasswordWithCodeMutation.mutate({ email, newPassword: password, code }, {
                onSuccess: (data) => {
                    toastSuccess(`Password for ${data.updated.email} has been updated successfully!`)
                },
                onError: (error) => {
                    toastError(error.message)
                },
                onSettled: () => {
                    setLoading(false);
                    setOpen(false)
                },
            })
        }

        setLoading(true);
        resetPasswordRequestMutation.mutate(
            { email },
            {
                onSuccess({ user, tempPassword }) {
                    const message = render(<ResetPasswordEmail securityCode={tempPassword} username={user.name} />)
                    resetPasswordEmailMutation.mutate({ email, message })
                    toastSuccess(`please check your email ${user.email} for the security code!`);
                    setPasswordForm(true)
                    setLoading(false);
                },
                onError(error) {
                    toastError(error.message)
                    setLoading(false);
                },
                onSettled() {
                    setLoading(false);
                },
            }
        );
    };

    return (
        <div className="mt-2 flex flex-col items-center mx-auto">
            <div className="flex flex-col items-center p-4">
                <Lock />
                <Typography variant={"primary"}>
                    {"Reset Password"}
                </Typography>
            </div>
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleResetPassword(form.getValues())
                    }}
                    aria-disabled={loading}
                    className="flex w-full flex-col justify-between p-4 space-y-4"
                >
                    <div className="flex-col flex gap-2">
                        {!passwordForm ? (<FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            disabled={loading}
                                            placeholder="Example@mail.com"
                                            {...field}
                                            className="pl-8"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />) :
                            (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Security Code</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        disabled={loading}
                                                        placeholder="1234"
                                                        {...field}
                                                        className="pl-8"
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
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        disabled={loading}
                                                        placeholder="new password"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="passwordConfirmation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password Confirmation</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        disabled={loading}
                                                        placeholder="confrim new password"
                                                        {...field}
                                                        className="pl-8"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                    </div>
                    <Button
                        disabled={loading}
                        type="submit"
                        className="relative"
                    >
                        {loading && (
                            <Spinner className="w-6 h-6 absolute" />
                        )}
                        <Typography className={loading ? "opacity-0" : ""}>
                            {passwordForm ? "Reset" : "Get code"}
                        </Typography>
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default ResetPasswordForm
