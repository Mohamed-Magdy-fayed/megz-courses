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

interface RefundFormProps {
    orderId: string;
    userId: string;
    paymentsTotal: number;
    onClose: () => void;
}

const formSchema = z.object({
    refundAmount: z.number().min(10, "Refund amount is required").nullable(),
    refundProof: z.string().min(1, "Refund Proof is required"),
});

type RefundFormValues = z.infer<typeof formSchema>;

export const RefundForm = ({
    orderId,
    userId,
    paymentsTotal,
    onClose,
}: RefundFormProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const { toastError, toast } = useToast();

    const defaultValues: z.infer<typeof formSchema> = {
        refundAmount: null,
        refundProof: "",
    };

    const form = useForm<RefundFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const trpcUtils = api.useUtils()
    const createRefundMutation = api.refunds.create.useMutation(
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

    const onSubmit = (data: RefundFormValues) => {
        const { refundAmount, refundProof } = data
        if (!refundAmount) return toastError("Refund amount is required!")
        createRefundMutation.mutate({ refundAmount, refundProof, orderId, userId })
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
                    name="refundAmount"
                    render={({ field }) => (
                        <FormItem className="p-4">
                            <FormLabel>Refund Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    disabled={!!loadingToast}
                                    autoFocus
                                    placeholder="99.99"
                                    {...field}
                                    value={field.value ? field.value : undefined}
                                    onChange={(e) => {
                                        if (paymentsTotal < e.target.valueAsNumber) {
                                            form.setError("refundAmount", { message: "The refund amount is greater than the payments total, if you confirm the refund, the change will be added to the customer as balance." })
                                        } else {
                                            form.clearErrors("refundAmount")
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
                    name="refundProof"
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
                    <FormLabel>Payments total: {formatPrice(paymentsTotal)}</FormLabel>
                    <SpinnerButton isLoading={!!loadingToast || uploadingImage} variant="default" type="submit" text="Confirm refund" icon={DollarSignIcon} />
                </div>
            </form>
        </Form>
    );
};
