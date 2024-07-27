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
import SelectField from "./SelectField";
import Modal from "@/components/ui/modal";

interface CellActionProps {
    status: OrderStatus;
    id: string | null;
    orderId: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const CellAction: React.FC<CellActionProps> = ({ id, status, setOpen, orderId }) => {
    const { toastInfo, toastSuccess, toastError, toast } = useToast();
    const [refundReason, setRefundReason] = useState<("requested_by_customer" | "duplicate" | "fraudulent")[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const origin =
        typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : '';

    const URL = `${origin}`;

    const onCopy = () => {
        navigator.clipboard.writeText(`${URL}/payments?sessionId=${id}`);
        toastInfo("Payment link copied to the clipboard");
    };

    const refundOrderMutation = api.orders.refundOrder.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ success }) => toast({ variant: "info", description: success ? "refunded successfully" : "Unable to refund" }),
        onError: ({ message }) => toastError(message.startsWith("No such payment_intent") ? "Please refund the order manually!" : message),
        onSettled: () => setLoading(false),
    })
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

    const handleRefund = () => {
        if (!refundReason[0]) return toastError("please select a reason")
        refundOrderMutation.mutate({
            orderId,
            reason: refundReason[0],
        })
    }

    return (
        <>
            <Modal
                title="Refund"
                description="Select refund reason"
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                children={(
                    <div className="flex gap-4 items-center justify-between">
                        <SelectField
                            disabled={loading}
                            data={[
                                { active: true, label: "Customer request", value: "requested_by_customer" },
                                { active: true, label: "Dublicate", value: "duplicate" },
                                { active: true, label: "Fraud", value: "fraudulent" },
                            ]}
                            listTitle="Reasons"
                            placeholder="Select Refund Reason"
                            values={refundReason}
                            setValues={setRefundReason}
                            disableSearch
                        />
                        <div className="flex items-center gap-4">
                            <Button
                                disabled={loading}
                                onClick={() => setIsRefundModalOpen(false)}
                                variant={"outline"}
                                customeColor={"destructiveOutlined"}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                onClick={handleRefund}
                                customeColor={"success"}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            />
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
                    <DropdownMenuItem disabled={status !== "pending"} onClick={() => setOpen(true)}>
                        <LucideDollarSign className="w-4 h-4 mr-2" />
                        Manual payment
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status !== "pending"} onClick={handleResendPaymentLink}>
                        <Send className="w-4 h-4 mr-2" />
                        Resend payment link
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={status === "refunded"} onClick={() => {
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
