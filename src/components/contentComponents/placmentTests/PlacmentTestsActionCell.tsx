import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreVertical } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { RefundModal } from "@/components/modals/RefundModal";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import CustomTestGoogleForm from "@/components/FormsComponents/CustomTestGoogleForm";
import CustomTestForm from "@/components/FormsComponents/CustomTestForm";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, GoogleForm, GoogleFormQuestion, MaterialItem } from "@prisma/client";
import { api } from "@/lib/api";
import { AlertModal } from "@/components/modals/AlertModal";
import { Trash } from "lucide-react";
import Spinner from "@/components/Spinner";
import { createMutationOptions } from "@/lib/mutationsHelper";

interface ActionCellProps {
    id: string;
    evalForm: EvaluationForm & {
        materialItem: MaterialItem | null;
        submissions: EvaluationFormSubmission[];
        questions: EvaluationFormQuestion[];
        googleForm?: GoogleForm & {
            googleFormQuestions: GoogleFormQuestion[]
        } | null;
    };
}

const ActionCell: React.FC<ActionCellProps> = ({ id, evalForm }) => {
    const { toastInfo, toast } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils()

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedEvalForms }) => `${deletedEvalForms.count} Form deleted`,
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] })
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <Modal
                title="Edit"
                description="edit evaluation form"
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                children={(
                    <div>
                        {evalForm.googleFormUrl ? <CustomTestGoogleForm setIsOpen={setIsEditOpen} initialData={evalForm} /> : <CustomTestForm setIsOpen={setIsEditOpen} initialData={evalForm} />}
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
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsEditOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteOpen(true)
                        setIsOpen(false)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;
