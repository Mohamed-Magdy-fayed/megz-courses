import { useEffect, useState } from "react";
import Modal from "../ui/modal";
import { Button } from "../ui/button";
import { api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: string) => void;
    loading: boolean;
}

export const RefundModal = ({
    isOpen,
    loading,
    onClose,
    onConfirm,
}: RefundModalProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const [reason, setReason] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Modal
            title="Refund"
            description="select refund reason"
            isOpen={isOpen}
            onClose={onClose}
        >
            <Select
                disabled={loading}
                // @ts-ignore
                onValueChange={(e) => setReason(e)}
            >
                <SelectTrigger className="pl-8">
                    <SelectValue
                        placeholder="Select reason"
                    />
                </SelectTrigger>
                <SelectContent>
                    {[
                        { id: "1", value: "reason1", label: "Reason 1" },
                        { id: "2", value: "reason2", label: "Reason 2" },
                        { id: "3", value: "reason3", label: "Reason 3" },
                        { id: "4", value: "reason4", label: "Reason 4" },
                        { id: "5", value: "reason5", label: "Reason 5" },

                    ].map(reasonData => (
                        <SelectItem key={reasonData.id} value={reasonData.value}>{reasonData.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex w-full items-center justify-end space-x-2 pt-6">
                <Button disabled={loading} variant="outline" customeColor={"mutedOutlined"} onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={loading} variant="default" onClick={() => onConfirm(reason)}>
                    Continue
                </Button>
            </div>
        </Modal>
    );
};
