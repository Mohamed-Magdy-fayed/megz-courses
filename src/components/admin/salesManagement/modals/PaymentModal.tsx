import { PaymentForm } from "@/components/admin/salesManagement/forms/PaymentForm";
import Modal from "@/components/ui/modal";
import { Dispatch, SetStateAction } from "react";

export default function PaymentModal({ orderNumber, userId, remainingAmount, isOpen, setIsOpen }: { orderNumber: string; userId: string; remainingAmount: number; isOpen: boolean; setIsOpen: Dispatch<SetStateAction<boolean>> }) {

    return (
        <Modal
            title="Manual Payment"
            description="please upload the proof of the payment amount"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={
                <PaymentForm
                    onClose={() => setIsOpen(false)}
                    orderNumber={orderNumber}
                    userId={userId}
                    remainingAmount={remainingAmount}
                />
            }
        />
    )
}
