import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, LucideDollarSign, MoreVertical, Send } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { OrderStatus } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";
import { api } from "@/lib/api";
import { render } from "@react-email/render";
import Email from "../emails/Email";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";

interface CellActionProps {
    status: OrderStatus;
    id: string | null;
    orderId: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const CellAction: React.FC<CellActionProps> = ({ id, status, setOpen, orderId }) => {
    const { toastInfo, toastSuccess, toastError } = useToast();
    const origin =
        typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : '';

    const URL = `${origin}`;

    const onCopy = () => {
        navigator.clipboard.writeText(`${URL}/payments?sessionId=${id}`);
        toastInfo("Payment link copied to the clipboard");
    };

    const resendPaymentLinkMutation = api.orders.resendPaymentLink.useMutation()
    const sendEmailMutation = api.comms.sendEmail.useMutation()
    const trpcUtils = api.useContext()

    const handleSendEmail = ({
        orderId,
        email,
        subject,
        message,
        salesOperationId,
    }: {
        orderId: string,
        email: string,
        subject: string,
        message: string,
        salesOperationId: string,
    }) => {
        sendEmailMutation.mutate({
            email,
            subject,
            message,
            orderId,
            salesOperationId,
            alreadyUpdated: false
        }, {
            onError: (e) => toastError(e.message),
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                toastSuccess("Payment link resent to the customer")
                setOpen(false)
            }
        })
    }

    const handleResendPaymentLink = () => {
        resendPaymentLinkMutation.mutate({ orderId }, {
            onSuccess: ({ updatedOrder: { id, amount, orderNumber, user, courses, createdAt, salesOperationId }, paymentLink }) => {
                const message = render(
                    <Email
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={formatPrice(amount)}
                        orderNumber={orderNumber}
                        paymentLink={paymentLink}
                        customerName={user.name}
                        courses={courses.map(course => ({ courseName: course.name, coursePrice: formatPrice(course.price) }))}
                    />, { pretty: true }
                )
                handleSendEmail({
                    orderId: id,
                    email: user.email,
                    subject: `Thanks for your order ${orderNumber}`,
                    message,
                    salesOperationId,
                })
            },
            onError: (error) => toastError(error.message),
        })
    }

    return (
        <>
            <DropdownMenu>
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
                    <DropdownMenuItem disabled={status !== "pending"} onClick={() => setOpen(true)}>
                        <LucideDollarSign className="w-4 h-4 mr-2" />
                        Manual payment
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status !== "pending"} onClick={handleResendPaymentLink}>
                        <Send className="w-4 h-4 mr-2" />
                        Resend payment link
                    </DropdownMenuItem>
                    /**TODO
                    refund option
                    */
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
