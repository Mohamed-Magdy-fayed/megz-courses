import { RefundForm } from "@/components/admin/salesManagement/forms/RefundForm";
import Modal from "@/components/ui/modal";
import { Dispatch, SetStateAction } from "react";

export default function RefundModal({ orderId, userId, paymentsTotal, isOpen, setIsOpen }: { orderId: string; userId: string; paymentsTotal: number; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>> }) {
    return (
        <Modal
            title="Manual Refund"
            description="please upload the proof of the refund amount"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={
                <RefundForm
                    onClose={() => setIsOpen(false)}
                    orderId={orderId}
                    userId={userId}
                    paymentsTotal={paymentsTotal}
                />
            }
        />
    )
}
