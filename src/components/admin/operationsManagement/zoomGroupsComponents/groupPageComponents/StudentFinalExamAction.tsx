import SubmitOralTestModal from "@/components/general/modals/SubmitOralTestModal";
import { Button } from "@/components/ui/button";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { CheckSquareIcon } from "lucide-react";
import { useMemo, useState } from "react";

type FinalSubmission = {
    id: string;
    oralFeedback: string | null;
    oralQuestions: string | null;
};

export default function StudentFinalExamAction({
    studentName,
    finalSubmission,
    fallbackOralQuestions,
    isLocked,
    lockReason,
}: {
    studentName: string;
    finalSubmission?: FinalSubmission;
    fallbackOralQuestions?: string | null;
    isLocked: boolean;
    lockReason?: string;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>();
    const [oralFeedback, setOralFeedback] = useState("");
    const [progressionDecision, setProgressionDecision] = useState<
        "MoveNextLevel" | "RepeatLevel" | "CompleteCourse"
    >("MoveNextLevel");

    const { toast, toastError } = useToast();
    const trpcUtils = api.useUtils();

    const reviewMutation = api.systemFormSubmissions.approveFinalTestOutcome.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ targetLevelName, outcome }) =>
                outcome === "MoveNextLevel"
                    ? `${studentName} moved to waiting list for ${targetLevelName}`
                    : outcome === "RepeatLevel"
                        ? `${studentName} marked to repeat ${targetLevelName}`
                        : `${studentName} marked as course completed and certificate issued`,
        })
    );

    const isSubmissionReviewed = useMemo(() => {
        return !!finalSubmission?.oralFeedback?.includes("[Progress Decision]");
    }, [finalSubmission?.oralFeedback]);

    const canReview = !!finalSubmission?.id;

    const openReviewModal = () => {
        if (isLocked) {
            toastError(lockReason || `${studentName} final exam process is already completed.`);
            return;
        }

        if (!canReview) {
            toastError(`${studentName} has not submitted the final test yet.`);
            return;
        }

        setOralFeedback("");
        setProgressionDecision("MoveNextLevel");
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!finalSubmission?.id) return;
        if (!oralFeedback.trim()) return toastError("Please write oral feedback before submitting");

        reviewMutation.mutate({
            submissionId: finalSubmission.id,
            outcome: progressionDecision,
            notes: oralFeedback,
        });
    };

    return (
        <>
            <SubmitOralTestModal
                courseName={isSubmissionReviewed ? "Final Test Review (Update)" : "Final Test Review"}
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                loading={!!loadingToast}
                oralFeedback={oralFeedback}
                setOralFeedback={setOralFeedback}
                oralQuestions={finalSubmission?.oralQuestions || fallbackOralQuestions || null}
                handleSubmit={handleSubmit}
                progressionDecision={progressionDecision}
                setProgressionDecision={setProgressionDecision}
            />

            <WrapWithTooltip
                text={
                    isLocked
                        ? lockReason || "Final exam process is already completed"
                        : canReview
                            ? isSubmissionReviewed
                                ? "Update final test decision"
                                : "Review final test and decide progression"
                            : "Awaiting student final test submission"
                }
            >
                <Button
                    variant="outline"
                    customeColor={canReview && !isLocked ? "primaryOutlined" : "mutedOutlined"}
                    onClick={openReviewModal}
                    disabled={isLocked}
                >
                    Final Exam
                    <CheckSquareIcon className="ml-2 h-4 w-4" />
                </Button>
            </WrapWithTooltip>
        </>
    );
}
