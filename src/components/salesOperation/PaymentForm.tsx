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

interface PaymentFormProps {
    id?: string;
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const formSchema = z.object({
    paymentAmount: z.string(),
    paymentConfirmation: z.string(),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export const PaymentForm = ({
    id,
    isOpen,
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
                trpcUtils.salesOperations.invalidate().then(() => {
                    setLoading(false)
                    onClose()
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
    if (!isOpen) return null

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
                                <Input type="number" placeholder="99.99" {...field} />
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
                                <MaterialImageUpload
                                    value={field.value}
                                    disabled={loading}
                                    onChange={(url) => field.onChange(url)}
                                    onRemove={() => field.onChange("")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex w-full items-center justify-end space-x-2 pt-6">
                    <Button disabled={loading} variant="outline" customeColor={"mutedOutlined"} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={loading} variant="default" type="submit">
                        Confirm payment
                    </Button>
                </div>
            </form>
        </Form>
    );
};
