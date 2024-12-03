import { api } from "@/lib/api";
import { Typography } from "../ui/Typoghraphy";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { toastType, useToast } from "../ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import Spinner from "../Spinner";
import { signIn } from "next-auth/react";
import { CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import MobileNumberInput from "@/components/ui/phone-number-input";
import { createMutationOptions } from "@/lib/mutationsHelper";

export const passwordSchema = z.string().min(6, "Password must be at least 6 characters long")
    .refine(
        (value) =>
            /[a-z]/.test(value) &&   // At least one lowercase letter
            /[A-Z]/.test(value) &&   // At least one uppercase letter
            /[0-9]/.test(value) &&   // At least one number
            /[!@#$%^&*(),.?":{}|<>]/.test(value),  // At least one special character
        {
            message: "Password must include uppercase, lowercase, number, and special character",
        }
    )

export const authFormSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Not a valid Email").min(5, "Please add your email"),
    password: passwordSchema,
    phone: z.string().optional(),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
    authType: "login" | "register"
    setOpen?: Dispatch<SetStateAction<boolean>>
}

const AuthForm: FC<AuthFormProps> = ({ authType, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const { toastError, toastSuccess, toast } = useToast()

    const defaultValues: AuthFormValues = {
        name: "",
        email: "",
        password: "",
        phone: "",
    }

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authFormSchema),
        defaultValues,
    });

    const trpcUtils = api.useUtils()
    const registerMutation = api.auth.register.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ user }, { password }) => {
                if (setOpen) {
                    signIn("credentials", {
                        email: user.email,
                        password,
                        redirect: false,
                    }).then(() => {
                        setOpen(false)
                    })

                    return `Welcome ${user.name.split(" ")[0]}, happy to have you on board`
                } else {
                    signIn("credentials", {
                        email: user.email,
                        password,
                        redirect: false,
                    })

                    return `Welcome ${user.name.split(" ")[0]}, happy to have you on board`
                }
            }
        })
    );

    const handleResgiter = ({ email, password, name, phone }: AuthFormValues) => {
        if (!name || !email || !password || !phone) return toastError("Missing some of your info!")

        registerMutation.mutate({ name, email, password, phone });
    };

    const handleLogin = ({ email, password }: AuthFormValues) => {
        setLoading(true)
        signIn("credentials", {
            email,
            password,
            redirect: false,
        })
            .then((res) => {
                if (setOpen) {
                    setOpen(false)
                } else {
                    if (res?.error) {
                        toastError(res.error)
                        setLoadingToast(undefined)
                        setLoading(false)
                    }

                    if (res?.ok && !res?.error) {
                        toastSuccess("Welcome")
                        setLoading(false)
                    }
                }
            })
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(authType === "login" ? handleLogin : handleResgiter)}
                className="flex w-full flex-col justify-between p-4 max-w-md"
            >
                <CardContent className="p-4 grid">
                    <div className="flex-col flex gap-2">
                        {authType === "register" && (
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={!!loadingToast}
                                                placeholder="Jon Doe"
                                                {...field}
                                                className="pl-8"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
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
                        />
                        {authType === "register" && (
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile</FormLabel>
                                        <FormControl>
                                            <MobileNumberInput
                                                onError={(isError) => {
                                                    form.clearErrors("phone")
                                                    if (isError) {
                                                        form.setError("phone", { message: "Not a valid number!" })
                                                        return
                                                    }
                                                }}
                                                value={field.value || ""}
                                                setValue={(val) => field.onChange(val)}
                                                placeholder="Phone Number"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
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
                                            placeholder="Password"
                                            {...field}
                                            className="pl-8"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter className="grid place-content-center p-4">
                    <Button
                        disabled={!!loadingToast || loading}
                        type="submit"
                        className="relative"
                    >
                        {(loadingToast || loading) && (
                            <Spinner className="w-6 h-6 absolute" />
                        )}
                        <Typography className={loadingToast || loading ? "opacity-0" : ""}>
                            {authType === "login" ? "Sign In" : "Sign Up"}
                        </Typography>
                    </Button>
                </CardFooter>
            </form>
        </Form>
    );
}

export default AuthForm
