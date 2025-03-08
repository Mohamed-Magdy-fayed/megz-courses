import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUploader from "@/components/ui/ImageUploader";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { SpinnerButton } from "@/components/ui/button";
import { DollarSignIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PaymentFormProps {
    orderNumber: string;
    userId: string;
    remainingAmount: number;
    onClose: () => void;
}

const formSchema = z.object({
    paymentAmount: z.number().min(10, "Payment amount is required").nullable(),
    paymentProof: z.string().min(1, "Payment Proof is required"),
});

type PaymentFormValues = z.infer<typeof formSchema>;

export const PaymentForm = ({
    orderNumber,
    userId,
    remainingAmount,
    onClose,
}: PaymentFormProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const { toastError, toast } = useToast();

    const defaultValues: z.infer<typeof formSchema> = {
        paymentAmount: null,
        paymentProof: "",
    };

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const trpcUtils = api.useUtils()
    const createPaymentMutation = api.payments.create.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils: trpcUtils.orders,
            successMessageFormatter: ({ }) => {
                onClose()
                return ``
            }
        })
    )

    const onSubmit = (data: PaymentFormValues) => {
        const { paymentAmount, paymentProof } = data
        if (!paymentAmount) return toastError("Payment amount is required!")
        createPaymentMutation.mutate({ paymentAmount, paymentProof, orderNumber, userId })
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
                <FormField
                    control={form.control}
                    name="paymentProof"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormControl>
                                <ImageUploader
                                    disabled={uploadingImage || !!loadingToast}
                                    onRemove={() => field.onChange("")}
                                    onChange={(url) => field.onChange(url)}
                                    onLoading={setUploadingImage}
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
                <div className="flex w-full items-center justify-between space-x-2 pt-6 gap-4">
                    <FormLabel>Order Balance: {formatPrice(remainingAmount)}</FormLabel>
                    <SpinnerButton isLoading={!!loadingToast || uploadingImage} variant="default" type="submit" text="Confirm payment" icon={DollarSignIcon} />
                </div>
            </form>
        </Form>
    );
};
