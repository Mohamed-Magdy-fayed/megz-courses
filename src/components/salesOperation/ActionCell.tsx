import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Coins, Copy, LucideDollarSign, MoreVertical, Send } from "lucide-react";
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

    const { data: siteData } = api.siteIdentity.getSiteIdentity.useQuery()
    const resendPaymentLinkMutation = api.orders.resendPaymentLink.useMutation()
    const sendEmailMutation = api.emails.sendEmail.useMutation()
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
            onSuccess: ({ updatedOrder: { id, amount, orderNumber, user, courses, createdAt, salesOperationId, courseTypes }, paymentLink }) => {
                const message = render(
                    <Email
                        logoUrl={siteData?.siteIdentity.logoPrimary || ""}
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={formatPrice(amount)}
                        orderNumber={orderNumber}
                        paymentLink={paymentLink}
                        customerName={user.name}
                        courses={courses.map(course => ({
                            courseName: course.name,
                            coursePrice: courseTypes.find(type => type.id === course.id)?.isPrivate
                                ? formatPrice(course.privatePrice)
                                : formatPrice(course.groupPrice)
                        }))} />, { pretty: true }
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
