import Spinner from "@/components/ui/Spinner"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { formatPercentage } from "@/lib/utils"
import { SystemFormSubmissionAnswer, SystemFormTypes } from "@prisma/client"
import { FC, useState } from "react"

type SystemFormResultProps = {
    isSubmitted: boolean;
    score: number;
    totalScore: number;
    systemFormId: string;
    courseSlug?: string;
    levelId?: string;
    answers: Omit<SystemFormSubmissionAnswer, "isCorrect">[];
    type: SystemFormTypes;
}

export const SystemFormResult: FC<SystemFormResultProps> = ({ type, isSubmitted, score, totalScore, systemFormId, answers, courseSlug, levelId }) => {
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const formattedScore = formatPercentage((score / totalScore * 100) || 0)

    const trpcUtils = api.useUtils()
    const createSubmissionMutation = api.systemFormSubmissions.createSystemFormSubmission.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ submission }) => `Thank you, You scored ${submission.totalScore} of ${totalScore} points With a percentage of ${formatPercentage(submission.totalScore / totalScore * 100)}`
        })
    )

    const handleSubmit = () => {
        createSubmissionMutation.mutate({
            type,
            formId: systemFormId,
            answers: answers.map(ans => ({ ...ans, textAnswer: ans.textAnswer ?? undefined })),
            courseSlug,
            levelId,
        })
    }

    return isSubmitted ? (
        <Typography>Submitted Already - {formattedScore}</Typography>
    ) : (
        <Button
            type="button"
            className="relative"
            disabled={!!loadingToast}
            onClick={handleSubmit}
        >
            {!!loadingToast && <Spinner className="w-4 h-4 mr-2" />}
            <Typography>
                {!!loadingToast ? "Loading..." : "Submit"}
            </Typography>
        </Button>
    )
}
