import { api } from "@/lib/api";
import { Lock } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { toastType, useToast } from "../ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import Spinner from "../Spinner";
import { Input } from "../ui/input";
import { render } from "@react-email/render";
import ResetPasswordEmail from "../emails/ResetPasswordEmail";

export const resetPasswordFormSchema = z.object({
    email: z.string().email().min(5, "please enter a valid email").optional(),
    code: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long")
        .refine(
            (value) =>
                /[a-z]/.test(value) &&   // At least one lowercase letter
                /[A-Z]/.test(value) &&   // At least one uppercase letter
                /[0-9]/.test(value) &&   // At least one number
                /[!@#$%^&*(),.?":{}|<>]/.test(value),  // At least one special character
            {
                message: "Password must include uppercase, lowercase, number, and special character",
            }
        ).optional(),
    passwordConfirmation: z.string().optional(),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

type ResetPasswordFormProps = {
    setOpen: Dispatch<SetStateAction<boolean>>
}

const ResetPasswordForm: FC<ResetPasswordFormProps> = ({ setOpen }) => {
    const [passwordForm, setPasswordForm] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const { toastError, toastSuccess, toast } = useToast()

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

    const { data: siteData } = api.siteIdentity.getSiteIdentity.useQuery()
    const resetPasswordRequestMutation = api.auth.resetPasswordRequest.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 3000,
            }))
        },
        onSuccess: ({ tempPassword, user }) => {
            const message = render(<ResetPasswordEmail logoUrl={siteData?.siteIdentity.logoPrimary || ""} securityCode={tempPassword} username={user.name} />)
            resetPasswordEmailMutation.mutate({ email: user.email, message })
            loadingToast?.update({
                id: loadingToast.id,
                variant: "success",
                description: `please check your email ${user.email} for the security code!`,
                title: "Success",
            })
            setPasswordForm(true)
        },
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        }
    });
    const resetPasswordEmailMutation = api.auth.resetPasswordEmail.useMutation({
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        }
    });
    const resetPasswordWithCodeMutation = api.auth.resetPasswordWithCode.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 3000,
            }))
        },
        onSuccess: ({ updated }) => {
            loadingToast?.update({
                id: loadingToast.id,
                variant: "success",
                title: "Success",
                description: `Password for ${updated.email} has been updated successfully!`,
            })
            setOpen(false)
        },
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    });

    const handleResetPassword = async ({ email, code, password, passwordConfirmation }: ResetPasswordFormValues) => {
        if (!email) {
            return toastError("please enter your email");
        }

        if (passwordForm) {
            if (!code) return toastError("Please provide security code from your email!")
            if (!password) return toastError("Please add a new password!")
            if (password !== passwordConfirmation) return toastError("Passwords don't match")
            return resetPasswordWithCodeMutation.mutate({ email, newPassword: password, code })
        }

        resetPasswordRequestMutation.mutate({ email });
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
                    onSubmit={form.handleSubmit(handleResetPassword)}
                    aria-disabled={!!loadingToast}
                    className="flex w-full max-w-md flex-col justify-between p-4 space-y-4"
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
                                            disabled={!!loadingToast}
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
                                                        disabled={!!loadingToast}
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
                                                        disabled={!!loadingToast}
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
                                                        disabled={!!loadingToast}
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
                        disabled={!!loadingToast}
                        type="submit"
                        className="relative"
                    >
                        {!!loadingToast && (
                            <Spinner className="w-6 h-6 absolute" />
                        )}
                        <Typography className={!!loadingToast ? "opacity-0" : ""}>
                            {passwordForm ? "Reset" : "Get code"}
                        </Typography>
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default ResetPasswordForm
