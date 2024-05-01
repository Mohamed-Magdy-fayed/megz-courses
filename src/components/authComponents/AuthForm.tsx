import { api } from "@/lib/api";
import { Lock } from "lucide-react";
import { Typography } from "../ui/Typoghraphy";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import Spinner from "../Spinner";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useRouter } from "next/router";

export const authFormSchema = z.object({
    name: z.string().nonempty().optional(),
    email: z.string().email(),
    password: z.string().min(4),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
    authType: "login" | "register"
}

const AuthForm: FC<AuthFormProps> = ({ authType }) => {
    const [loading, setLoading] = useState(false);
    const { toastError, toastSuccess } = useToast()
    const router = useRouter()

    const defaultValues: AuthFormValues = {
        name: "",
        email: "",
        password: "",
    }

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(authFormSchema),
        defaultValues,
    });

    const registerMutation = api.auth.register.useMutation();

    const handleResgiter = ({ email, password, name }: AuthFormValues) => {
        if (!name || !email || !password) {
            return toastError("please fill all the data");
        }

        setLoading(true);
        registerMutation.mutate(
            { name: name, email: email, password: password },
            {
                onSuccess(data) {
                    if (data.user)
                        toastSuccess(`user (${data.user.name}) created successfully`);
                    router.push('/authentication?variant=login')
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

    const handleLogin = ({ email, password }: AuthFormValues) => {
        setLoading(true);
        signIn("credentials", {
            email,
            password,
            redirect: false,
        })
            .then((res) => {

                if (res?.error) {
                    toastError(res.error);
                    setLoading(false);
                }

                if (res?.ok && !res?.error) {
                    toastSuccess("loggedin");
                }
            })
    };

    return (
        <Card className="mt-2 flex flex-col items-center mx-auto">
            <CardHeader className="flex flex-col items-center p-4">
                <Lock />
                <Typography variant={"primary"}>
                    {authType === "login" ? "Sign in" : "Sign up"}
                </Typography>
            </CardHeader>
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        authType === "login" ? handleLogin(form.getValues()) : handleResgiter(form.getValues())
                    }}
                    className="flex w-full flex-col justify-between p-4"
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
                                                    disabled={loading}
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
                                                disabled={loading}
                                                placeholder="Example@mail.com"
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
                            disabled={loading}
                            type="submit"
                            className="relative"
                        >
                            {loading && (
                                <Spinner className="w-6 h-6 absolute" />
                            )}
                            <Typography className={loading ? "opacity-0" : ""}>
                                {authType === "login" ? "Sign In" : "Sign Up"}
                            </Typography>
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

export default AuthForm
