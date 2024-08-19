import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RefundModal } from "@/components/modals/RefundModal";
import { useState } from "react";
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, MaterialItem } from "@prisma/client";
import Modal from "@/components/ui/modal";
import CustomTestGoogleForm from "@/components/FormsComponents/CustomTestGoogleForm";
import CustomTestForm from "@/components/FormsComponents/CustomTestForm";
import { api } from "@/lib/api";

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
    const { toastInfo, toastSuccess, toastError } = useToast();
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isRefundOpen, setIsRefundOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation()

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    const onDelete = (callback?: () => void) => {
        setLoading(true)
        deleteMutation.mutate(
            { ids: [id] },
            {
                onSuccess: (data) => {
                    trpcUtils.invalidate()
                        .then(() => {
                            callback?.()
                            toastSuccess(`Deleted ${data.deletedEvalForms.count} final test`)
                            setLoading(false)
                            setIsDeleteOpen(false)
                        })
                },
                onError: (error) => {
                    toastError(error.message)
                    setLoading(false)
                },
            }
        )
    };

    return (
        <>
            <Modal
                title="Delete"
                description="Delete evaluation form"
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                children={(
                    <div className="flex w-full items-center justify-end space-x-2 pt-6">
                        <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
                            Continue
                        </Button>
                    </div>
                )}
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
            <DropdownMenu open={isOpen} onOpenChange={(val) => { setIsOpen(val) }}>
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
