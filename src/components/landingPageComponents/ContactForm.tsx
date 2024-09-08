import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Typography } from "../ui/Typoghraphy";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
    name: z.string().min(1, "Please add a name"),
    email: z.string().email("invalid email address").min(1, "Please add your email"),
    message: z.string().min(1, "how can we help?"),
});

type ContactFormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
    const [loading, setLoading] = useState(false);
    const { toastSuccess } = useToast()

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        email: "",
        message: "",
    };

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const mutation = api.emails.sendZohoEmail.useMutation()

    const onSubmit = ({ email, message, name }: ContactFormValues) => {
        setLoading(true)
        mutation.mutate({
            email: email,
            html: `name: ${name} email: ${email} message: ${message}`,
            subject: `${name}: ${message.split(" ").slice(0, 10).join(" ")}`,
        }, {
            onSuccess: ({ message }) => {
                toastSuccess(message)
                setLoading(false)
            }
        })
    };

    return (
        <div className="flex items-center justify-center lg:p-8 p-4">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md w-full"
                >
                    <Card className="">
                        <CardContent className="p-4">
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
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                disabled={loading}
                                                placeholder="Example@mail.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                disabled={loading}
                                                placeholder="How can we help?"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <Separator></Separator>
                        <CardFooter className="p-4 h-full">
                            <Button disabled={loading} type="submit">
                                <Typography variant={"buttonText"}>Submit</Typography>
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    )
}

export default ContactForm