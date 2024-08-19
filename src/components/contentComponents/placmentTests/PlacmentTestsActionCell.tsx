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
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, MaterialItem } from "@prisma/client";
import { api } from "@/lib/api";
import { AlertModal } from "@/components/modals/AlertModal";
import { Trash } from "lucide-react";
import Spinner from "@/components/Spinner";

interface ActionCellProps {
    id: string;
    externalLink: string | null;
    evalForm: EvaluationForm & {
        materialItem: MaterialItem | null;
        submissions: EvaluationFormSubmission[];
        questions: EvaluationFormQuestion[];
    };
}

const ActionCell: React.FC<ActionCellProps> = ({ id, evalForm, externalLink }) => {
    const { toastInfo, toast } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isRefundOpen, setIsRefundOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useContext()

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 3000,
            }))
        },
        onSuccess: ({ deletedEvalForms }) => trpcUtils.courses.invalidate().then(() => {
            loadingToast?.update({
                id: loadingToast.id,
                variant: "success",
                description: `${deletedEvalForms.count} Form deleted`,
                title: "Success",
            })
            setIsDeleteOpen(false)
        }),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    })
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
                        {externalLink ? <CustomTestGoogleForm setIsOpen={setIsEditOpen} initialData={evalForm} /> : <CustomTestForm setIsOpen={setIsEditOpen} initialData={evalForm} />}
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
