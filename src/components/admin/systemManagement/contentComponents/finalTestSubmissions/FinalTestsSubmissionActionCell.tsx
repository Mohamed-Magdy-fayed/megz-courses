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
import { FinalTestSubmissionRow } from "@/components/admin/systemManagement/contentComponents/finalTestSubmissions/FinalTestSubmissionsColumn";
import { AlertModal } from "@/components/general/modals/AlertModal";
import Link from "next/link";
import SubmitOralTestModal from "@/components/general/modals/SubmitOralTestModal";

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
    const [progressionDecision, setProgressionDecision] = useState<"MoveNextLevel" | "RepeatLevel" | "CompleteCourse">("MoveNextLevel")

    const { toast, toastError } = useToast();
    const trpcUtils = api.useUtils()

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

    const approveOutcomeMutation = api.systemFormSubmissions.approveFinalTestOutcome.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ student, targetLevelName, outcome }) => {
                setIsUpdateOralOpen(false)
                return outcome === "MoveNextLevel"
                    ? `Oral feedback submitted. ${student.name} moved to waiting list for ${targetLevelName}`
                    : outcome === "RepeatLevel"
                        ? `Oral feedback submitted. ${student.name} marked to repeat ${targetLevelName} and added to waiting list`
                        : `Oral feedback submitted. ${student.name} marked as course completed and certificate issued`
            }
        })
    )

    const handleSubmit = () => {
        if (!oralFeedback.trim()) return toastError("Please write oral feedback before submitting")

        approveOutcomeMutation.mutate({
            submissionId: id,
            outcome: progressionDecision,
            notes: oralFeedback,
        })
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
                progressionDecision={progressionDecision}
                setProgressionDecision={setProgressionDecision}
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
                        Oral Test + Progression Decision
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
