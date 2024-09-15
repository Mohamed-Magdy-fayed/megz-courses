import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import ConnectGoogleForm from "@/components/FormsComponents/ConnectGoogleForm";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, GoogleForm, GoogleFormQuestion, MaterialItem } from "@prisma/client";
import CustomForm from "@/components/FormsComponents/CustomForm";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { AlertModal } from "@/components/modals/AlertModal";

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
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Deleting...",
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
            duration: 30000,
        })),
        onSuccess: (data) => {
            trpcUtils.invalidate()
                .then(() => {
                    loadingToast?.update({
                        id: loadingToast.id,
                        title: "Success",
                        description: `${data.deletedEvalForms.count} forms deleted`,
                        variant: "success",
                    })
                    loadingToast?.dismissAfter()
                    setIsOpen(false)
                    setLoadingToast(undefined)
                })
        },
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive",
        }),
        onSettled: () => {
        },
    })

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] })
    }

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
                        {evalForm.googleForm ? <ConnectGoogleForm setIsOpen={setIsEditOpen} initialData={evalForm} /> : <CustomForm initialData={evalForm} />}
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
