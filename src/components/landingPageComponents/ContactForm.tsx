import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "../ui/use-toast";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardFooter } from "../ui/card";

const formSchema = z.object({
    name: z.string().nonempty("Please add a name"),
    email: z.string().email("invalid email address").nonempty("Please add your email"),
    message: z.string().nonempty("how can we help?"),
});

type UsersFormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
    const [loading, setLoading] = useState(false);

    const defaultValues: z.infer<typeof formSchema> = {
        name: "",
        email: "",
        message: "",
    };

    const form = useForm<UsersFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });


    const onSubmit = (data: UsersFormValues) => {
        console.log(data);

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