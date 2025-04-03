import { PaymentLinkForm } from "@/components/admin/salesManagement/forms/PaymentLinkForm";
import { LeadOrderColumn } from "@/components/admin/salesManagement/leads/LeadOrdersColumns";
import PaymentModal from "@/components/admin/salesManagement/modals/PaymentModal";
import RefundModal from "@/components/admin/salesManagement/modals/RefundModal";
import { AlertModal } from "@/components/general/modals/AlertModal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { CoinsIcon, Link2Icon } from "lucide-react";
import { ChevronDownIcon, DollarSignIcon, ExternalLinkIcon, XCircleIcon } from "lucide-react";
import { useState } from "react";

export default function LeadOrderActions(leadOrder: LeadOrderColumn) {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
    const [isTakePaymentOpen, setIsTakePaymentOpen] = useState(false)
    // const [isPaymobOpen, setIsPaymobOpen] = useState(false)
    const [isCancelOpen, setIsCancelOpen] = useState(false)

    const trpcUtils = api.useUtils()
    const cancelMutation = api.orders.cancel.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.products,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ cancelledOrder }) => {
                setIsCancelOpen(false)
                return `Order ${cancelledOrder.orderNumber} has been cancelled!`
            },
            loadingMessage: "Cancelling...",
        })
    )

    const onCancel = () => {
        cancelMutation.mutate({ orderId: leadOrder.id })
    };

    return (
        <>
            <AlertModal
                description={`Are you sure you want to cancel this order ${leadOrder.orderNumber}`}
                isOpen={isCancelOpen}
                onClose={() => setIsCancelOpen(false)}
                loading={!!loadingToast}
                onConfirm={onCancel}
            />
            <PaymentModal isOpen={isTakePaymentOpen} setIsOpen={setIsTakePaymentOpen} orderNumber={leadOrder.orderNumber} userId={leadOrder.userId} remainingAmount={leadOrder.remainingAmount} />
            <RefundModal isOpen={isRefundModalOpen} setIsOpen={setIsRefundModalOpen} orderId={leadOrder.id} userId={leadOrder.userId} paymentsTotal={leadOrder.paidAmount} />
            {/* <Modal
                title="Payment Link"
                description="Send the customer a payment link with the specified amount"
                isOpen={isPaymobOpen}
                onClose={() => setIsPaymobOpen(false)}
                children={
                    <PaymentLinkForm
                        onClose={() => setIsPaymobOpen(false)}
                        orderNumber={leadOrder.orderNumber}
                        remainingAmount={leadOrder.remainingAmount}
                    />
                }
            /> */}
            <DropdownMenu open={isMenuOpen} onOpenChange={(val) => setIsMenuOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled={leadOrder.remainingAmount < 0} onClick={() => {
                        setIsTakePaymentOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <DollarSignIcon className="w-4 h-4 mr-2" />
                        Manual Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={leadOrder.remainingAmount === leadOrder.amount} onClick={() => {
                        setIsRefundModalOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <CoinsIcon className="w-4 h-4 mr-2" />
                        Refund
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => {
                        setIsPaymobOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <Link2Icon className="w-4 h-4 mr-2" />
                        Get Payment Link
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={() => {
                        setIsCancelOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Cancel
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
