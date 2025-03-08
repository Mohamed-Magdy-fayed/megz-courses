import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { SpinnerButton } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Link2Icon } from "lucide-react";

export const generateLinkSchema = z.object({
    paymentAmount: z.number(),
    orderNumber: z.string(),
})

type PaymentLinkFormProps = {
    orderNumber: string;
    remainingAmount: number;
    onClose: () => void;
};

const formSchema = z.object({
    paymentAmount: z.number().min(10, "Payment amount is required").nullable(),
});

type PaymentLinkFormValues = z.infer<typeof formSchema>;

export const PaymentLinkForm = ({
    orderNumber,
    remainingAmount,
    onClose,
}: Omit<PaymentLinkFormProps, "paymentAmount">) => {
    const [isMounted, setIsMounted] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const { toastError, toast } = useToast();

    const defaultValues: z.infer<typeof formSchema> = {
        paymentAmount: null,
    };

    const form = useForm<PaymentLinkFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const trpcUtils = api.useUtils()
    // const createPaymentLinkMutation = api.payments.generateLink.useMutation(
    //     createMutationOptions({
    //         loadingToast,
    //         setLoadingToast,
    //         toast,
    //         trpcUtils: trpcUtils.orders,
    //         successMessageFormatter: ({ }) => {
    //             onClose()
    //             return ``
    //         }
    //     })
    // )

    const onSubmit = (data: PaymentLinkFormValues) => {
        // const { paymentAmount } = data
        // if (!paymentAmount) return toastError("Payment amount is required!")
        // createPaymentLinkMutation.mutate({ paymentAmount, orderNumber })
    }

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col justify-between p-0 py-2 md:h-full"
            >
                <FormField
                    control={form.control}
                    name="paymentAmount"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    disabled={!!loadingToast}
                                    autoFocus
                                    placeholder="99.99"
                                    {...field}
                                    value={field.value ? field.value : undefined}
                                    onChange={(e) => {
                                        if (remainingAmount < e.target.valueAsNumber) {
                                            form.setError("paymentAmount", { message: "The payment amount is greater than the remaining balance on the order, if you confirm the payment the change will be added to the customer as credit." })
                                        } else {
                                            form.clearErrors("paymentAmount")
                                        }
                                        field.onChange(e.target.valueAsNumber || null)
                                    }} />
                            </FormControl>
                            <FormMessage className="whitespace-pre-wrap" />
                        </FormItem>
                    )}
                />
                <div className="flex w-full items-center justify-between space-x-2 pt-6 gap-4">
                    <FormLabel>Order Balance: {formatPrice(remainingAmount)}</FormLabel>
                    <SpinnerButton isLoading={!!loadingToast} variant="default" type="submit" text="Generate Link" icon={Link2Icon} />
                </div>
            </form>
        </Form>
    );
};
