import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckSquareIcon, EyeIcon, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { FinalTestSubmissionRow } from "@/components/contentComponents/finalTestSubmissions/FinalTestSubmissionsColumn";
import { AlertModal } from "@/components/modals/AlertModal";
import Link from "next/link";
import SubmitOralTestModal from "@/components/modals/SubmitOralTestModal";

interface ActionCellProps {
    id: string;
    submission: FinalTestSubmissionRow;
}

const ActionCell: React.FC<ActionCellProps> = ({ id, submission }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isUpdateOralOpen, setIsUpdateOralOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()
    const [oralFeedback, setOralFeedback] = useState("")

    const { toast } = useToast();
    const trpcUtils = api.useUtils()

    const submitOralMutation = api.systemFormSubmissions.submitOralTest.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: () => {
                setIsUpdateOralOpen(false)
                return `Oral test feedback submitted!`
            }
        })
    )

    const deleteMutation = api.systemFormSubmissions.deleteSystemFormSubmission.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: () => {
                setIsDeleteOpen(false)
                return `Deleted submission successfully!`
            }
        })
    )

    const handleSubmit = () => {
        submitOralMutation.mutate({ id, oralFeedback })
    }

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] })
    }

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={onDelete}
                loading={!!loadingToast}
            />
            <SubmitOralTestModal
                courseName={"Oral Test"}
                isOpen={isUpdateOralOpen}
                setIsOpen={setIsUpdateOralOpen}
                loading={!!loadingToast}
                oralFeedback={oralFeedback}
                setOralFeedback={setOralFeedback}
                oralQuestions={submission.oralQuestions}
                handleSubmit={handleSubmit}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/subs/${id}`}>
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsUpdateOralOpen(true)
                    }}>
                        <CheckSquareIcon className="w-4 h-4 mr-2" />
                        Oral Test
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsDeleteOpen(true)
                    }}>
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;
