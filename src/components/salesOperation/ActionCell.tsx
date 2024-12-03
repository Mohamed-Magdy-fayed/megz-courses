import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Coins, Copy, LucideDollarSign, MoreVertical, Send } from "lucide-react";
import { toastType, useToast } from "../ui/use-toast";
import { OrderStatus } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";

interface CellActionProps {
    status: OrderStatus;
    id: string | null;
    paymentLink: string | null;
    orderId: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setIsRefundModalOpen: Dispatch<SetStateAction<boolean>>;
}

const CellAction: React.FC<CellActionProps> = ({ id, status, setOpen, orderId, paymentLink, setIsRefundModalOpen }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { data: setupData } = api.setup.getCurrentTier.useQuery()

    const onCopy = () => {
        if (!paymentLink) return toastError("No payment link")
        navigator.clipboard.writeText(paymentLink);
        setIsOpen(false)
        toastInfo("Payment link copied to the clipboard");
    };

    const { toastInfo, toast, toastError } = useToast();
    const trpcUtils = api.useUtils()
    const resendPaymentLinkMutation = api.orders.resendPaymentLink.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            trpcUtils,
            toast,
            successMessageFormatter: () => `Payment link resent successfully`
        })
    )

    const handleResendPaymentLink = () => {
        setIsOpen(false)
        resendPaymentLinkMutation.mutate({ orderId })
    }

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled={!id || status !== "Pending" || !setupData?.tier.onlinePayment} onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy payment link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status !== "Pending" || !setupData?.tier.onlinePayment} onClick={handleResendPaymentLink}>
                        <Send className="w-4 h-4 mr-2" />
                        Resend payment link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status !== "Pending"} onClick={() => {
                        setOpen(true)
                        setIsOpen(false)
                    }}>
                        <LucideDollarSign className="w-4 h-4 mr-2" />
                        Manual payment
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status === "Refunded" || status !== "Paid"} onClick={() => {
                        setIsRefundModalOpen(true)
                        setIsOpen(false)
                    }}>
                        <Coins className="w-4 h-4 mr-2" />
                        Refund
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
