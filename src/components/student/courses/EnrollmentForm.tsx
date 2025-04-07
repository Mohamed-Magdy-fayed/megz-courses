import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MobileNumberInput from "@/components/ui/phone-number-input";
import { Typography } from "@/components/ui/Typoghraphy";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/router";

const baseSchema = z.object({
    name: z.string().min(3, "Please enter your name!"),
    email: z.string().email("Please enter your email!"),
    phone: z.string().min(1, "Please enter your phone!"),
});

const courseSchema = baseSchema.extend({
    isPrivate: z.boolean(),
});

type EnrollmentFormValues = z.infer<typeof baseSchema & typeof courseSchema>

type CommonProps = {
    setIsOpen: (val: boolean) => void;
    submitTrigger: "PayNow" | "PayLater" | undefined;
    setSubmitTrigger: Dispatch<SetStateAction<"PayNow" | "PayLater" | undefined>>;
    hasOnlinePayment: boolean;
};

type ProductProps = CommonProps & {
    type: "product";
    productId: string;
};

type CourseProps = CommonProps & {
    type: "course";
    courseId: string;
    setIsPrivate: Dispatch<SetStateAction<boolean>>;
};

type EnrollmentFormProps = ProductProps | CourseProps;

export const EnrollmentForm: FC<EnrollmentFormProps> = (props) => {
    const router = useRouter();
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>();

    const isProduct = props.type === "product";
    const isCourse = props.type === "course";

    const form = useForm<EnrollmentFormValues>({
        resolver: zodResolver(isCourse ? courseSchema : baseSchema),
        defaultValues: isCourse
            ? { name: "", email: "", phone: "", isPrivate: false }
            : { name: "", email: "", phone: "" },
    });

    const trpcUtils = api.useUtils();

    const enrollMutation = api.selfServe.enrollCourse.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            loadingMessage: "Placing your order...",
            toast,
            trpcUtils,
            successMessageFormatter: ({ paymentLink, orderNumber }) => {
                if (paymentLink) {
                    router.push(paymentLink);
                    return "You will be redirected shortly";
                } else {
                    props.setIsOpen(false);
                    return `Order Number: ${orderNumber} created successfully, we will contact you soon!`;
                }
            },
        })
    );

    const handlePay = (data: EnrollmentFormValues) => {
        if (isProduct) {
            enrollMutation.mutate({ ...data, productId: props.productId, withPayment: props.submitTrigger === "PayNow", });
        } else {
            enrollMutation.mutate({ ...data, courseId: props.courseId, withPayment: props.submitTrigger === "PayNow" });
        }
    };

    const isPrivate = form.watch("isPrivate");

    useEffect(() => {
        if (isCourse) props.setIsPrivate(isPrivate);
    }, [isPrivate]);

    useEffect(() => {
        if (!props.submitTrigger) return;
        form.handleSubmit(handlePay, () => props.setSubmitTrigger(undefined))();
    }, [props.submitTrigger]);

    return (
        <Form {...form}>
            <form className="space-y-2">
                <Typography className="col-span-2" variant="secondary">Student Information</Typography>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!!loadingToast}
                                    placeholder="Mohamed Magdy"
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
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mobile (WhatsApp)</FormLabel>
                            <FormControl>
                                <MobileNumberInput
                                    placeholder="01100110011"
                                    setValue={(val) => field.onChange(val)}
                                    value={field.value}
                                    onError={(isError) => {
                                        form.clearErrors("phone");
                                        if (isError) {
                                            form.setError("phone", {
                                                message: "Not a valid number!",
                                            });
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isCourse && (
                    <FormField
                        control={form.control}
                        name="isPrivate"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Switch
                                            id={field.name}
                                            name={field.name}
                                            ref={field.ref}
                                            disabled={!!loadingToast}
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <FormLabel htmlFor={field.name}>
                                            Do you need a private class?
                                        </FormLabel>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Please note that prices might change!
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </form>
        </Form>
    );
};
