import { useEffect, useState } from "react";
import Modal from "@/components/ui/modal";
import CustomForm, { IFormInput } from "@/components/FormsComponents/CustomForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CustomFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: IFormInput) => void;
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
            title="Add an assignment"
            description="Add more questions as needed"
            isOpen={isOpen}
            onClose={onClose}
        >
            <ScrollArea className="h-[70vh]">
                <CustomForm />
            </ScrollArea>
        </Modal>
    );
};
