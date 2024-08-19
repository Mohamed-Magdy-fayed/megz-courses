import { useState } from "react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";
import { api } from "@/lib/api";
import { toastType, useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/Spinner";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

export const RefundModal = ({
    isOpen,
    orderId,
    onClose,
}: RefundModalProps) => {
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast } = useToast();

    const trpcUtils = api.useContext()
    const refundOrderMutation = api.orders.refundOrder.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
            duration: 60000,
        })),
        onSuccess: ({ success }) => trpcUtils.invalidate().then(() => {
            loadingToast?.update({
                id: loadingToast.id,
                title: "Success",
                variant: "success",
                description: success ? "refunded successfully" : "Unable to refund"
            })
            onClose()
        }),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive"
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    })

    const handleRefund = () => {
        refundOrderMutation.mutate({
            orderId,
        })
    }

    return (
        <Modal
            title="Are you sure you want to refund this order?"
            description="This action can't be undone!"
            isOpen={isOpen}
            onClose={() => onClose()}
            children={(
                <div className="flex items-center gap-4">
                    <Button
                        disabled={!!loadingToast}
                        onClick={() => onClose()}
                        variant={"outline"}
                        customeColor={"destructiveOutlined"}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!!loadingToast}
                        onClick={handleRefund}
                        customeColor={"success"}
                    >
                        Confirm
                    </Button>
                </div>
            )}
        />
    );
};
