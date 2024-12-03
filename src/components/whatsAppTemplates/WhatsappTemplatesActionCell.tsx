import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { toastType, useToast } from "../ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/ui/modal";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { AlertModal } from "@/components/modals/AlertModal";
import WhatsAppTemplatesForm from "@/components/whatsAppTemplates/WhatsAppTemplatesForm";

interface CellActionProps {
    id: string;
    name: string;
    body: string;
}

const CellAction: React.FC<CellActionProps> = ({ id, name, body }) => {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const trpcUtils = api.useUtils()
    const deleteMutation = api.whatsAppTemplates.deleteMessageTemplates.useMutation(
        createMutationOptions({
            toast,
            trpcUtils,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: () => {
                setIsDeleteModalOpen(false)
                return ``
            },
        })
    );

    const onDelete = () => {
        deleteMutation.mutate([id]);
    };

    return (
        <>
            <Modal
                title={"Edit Template"}
                description={""}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                children={
                    <WhatsAppTemplatesForm
                        setIsOpen={setIsEditModalOpen}
                        initialData={{ body, name, id }}
                    />
                }
            />
            <AlertModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onDelete}
                loading={!!loadingToast}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsEditModalOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteModalOpen(true)
                        setIsOpen(false)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu></>

    );
};

export default CellAction;
