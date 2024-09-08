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
import Spinner from "@/components/Spinner";
import { render } from "@react-email/render";
import Email from "@/components/emails/Email";
import { sendZohoEmail } from "@/lib/gmailHelpers";

interface CellActionProps {
    status: OrderStatus;
    id: string | null;
    paymentLink: string | null;
    orderId: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setIsRefundModalOpen: Dispatch<SetStateAction<boolean>>;
}

const CellAction: React.FC<CellActionProps> = ({ id, status, setOpen, orderId, paymentLink, setIsRefundModalOpen }) => {
    const { toastInfo, toastSuccess, toastError } = useToast();
    const [isOpen, setIsOpen] = useState(false)

    const onCopy = () => {
        if (!paymentLink) return toastError("No payment link")
        navigator.clipboard.writeText(paymentLink);
        toastInfo("Payment link copied to the clipboard");
    };

    const resendPaymentLinkMutation = api.orders.resendPaymentLink.useMutation({
        onSuccess: ({ emailProps }) => {
            const html = render(
                <Email
                    {...emailProps} />, { pretty: true }
            )

            sendZohoEmail({ email: emailProps.userEmail, subject: `Thanks for your order ${emailProps.orderNumber}`, html })
            toastSuccess("Payment link resent to the customer")
        },
        onError: ({ message }) => toastError(message),
        onSettled: () => trpcUtils.salesOperations.invalidate()
    })
    const trpcUtils = api.useContext()

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
                    <DropdownMenuItem disabled={!id || status !== "pending"} onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy payment link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status !== "pending"} onClick={() => {
                        setOpen(true)
                        setIsOpen(false)
                    }}>
                        <LucideDollarSign className="w-4 h-4 mr-2" />
                        Manual payment
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status !== "pending"} onClick={handleResendPaymentLink}>
                        <Send className="w-4 h-4 mr-2" />
                        Resend payment link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status === "refunded" || status !== "paid"} onClick={() => {
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
