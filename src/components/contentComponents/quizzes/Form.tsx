import { useEffect, useState } from "react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import CustomForm from "@/components/FormsComponents/CustomForm";

interface CustomFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    loading: boolean;
}

export const CustomFormModal = ({
    isOpen,
    loading,
    onClose,
    onConfirm,
}: CustomFormModalProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Modal
            title="Assign Task"
            description="Please select the assignee!"
            isOpen={isOpen}
            onClose={onClose}
        >
            <div>
                <CustomForm />
            </div>
            <div className="flex w-full items-center justify-end space-x-2 pt-6">
                <Button disabled={loading} variant="outline" customeColor={"mutedOutlined"} onClick={onClose}>
                    Cancel
                </Button>
                <Button disabled={loading} variant="default" onClick={() => onConfirm({ message: "hi" })}>
                    Continue
                </Button>
            </div>
        </Modal>
    );
};
