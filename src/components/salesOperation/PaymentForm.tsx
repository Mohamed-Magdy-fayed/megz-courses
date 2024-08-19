import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/input";
import MaterialImageUpload from "../ui/MaterialImageUpload";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUploader from "@/components/ui/ImageUploader";

interface PaymentFormProps {
    id?: string;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    onClose: () => void;
}

const formSchema = z.object({
    paymentAmount: z.string().min(1, "Payment Amount is required"),
    paymentConfirmation: z.string().min(1, "Payment Proof is required"),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export const PaymentForm = ({
    id,
    loading,
    setLoading,
    onClose,
}: PaymentFormProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const { toastError, toastSuccess } = useToast();

    const defaultValues: z.infer<typeof formSchema> = {
        paymentAmount: "",
        paymentConfirmation: "",
    };

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const payOrderManuallyMutation = api.orders.payOrderManually.useMutation()
    const trpcUtils = api.useContext()

    const onSubmit = (data: PaymentFormValues) => {
        const { paymentAmount, paymentConfirmation } = data
        if (!id) return
        setLoading(true)
        payOrderManuallyMutation.mutate({ amount: paymentAmount, id, paymentConfirmationImage: paymentConfirmation }, {
            onSuccess: ({ courseLink, updatedOrder }) => {
                toastSuccess(`order ${updatedOrder.orderNumber} payment status updated!`)
                sendWhatsAppMessage({
                    textBody: `Payment successfull ${updatedOrder.orderNumber} with ${formatPrice(updatedOrder.amount)}
                    \nYour can now access the content through this link: ${courseLink}`,
                    toNumber: "201123862218"
                })
                onClose()
                trpcUtils.salesOperations.invalidate().then(() => {
                    setLoading(false)
                })
            },
            onError: (error) => {
                toastError(error.message)
                setLoading(false)
            },
        })
    }

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col justify-between p-0 md:h-full"
            >
                <FormField
                    control={form.control}
                    name="paymentAmount"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                                <Input type="number" autoFocus placeholder="99.99" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="paymentConfirmation"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormControl>
                                <ImageUploader
                                    disabled={loading}
                                    onRemove={() => field.onChange("")}
                                    onChange={(url) => field.onChange(url)}
                                    customeImage={field.value && field.value.length > 0 ? (
                                        <img alt="user image" src={field.value} className="max-h-[72px]" />
                                    ) : (
                                        <Skeleton className="h-[72px] w-[128px] rounded-md" />
                                    )}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex w-full items-center justify-end space-x-2 pt-6">
                    <Button disabled={loading} variant="default" type="submit">
                        Confirm payment
                    </Button>
                </div>
            </form>
        </Form>
    );
};
