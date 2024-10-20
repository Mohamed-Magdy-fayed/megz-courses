import { Answer } from "@/components/placementTestView/QuestionComponent"
import Spinner from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { formatPercentage } from "@/lib/utils"
import { FC, useState } from "react"

type SystemTestResult = {
    isSubmitted: boolean;
    score: number;
    totalPoints: number;
    evaluationFormId: string;
    answers: Answer[];
}

export const SystemTestResult: FC<SystemTestResult> = ({ isSubmitted, score, totalPoints, evaluationFormId, answers }) => {
    const [createSubmissionToast, setCreateSubmissionToast] = useState<toastType>()

    const { toast } = useToast()
    const formattedScore = formatPercentage(score / totalPoints * 100)

    const trpcUtils = api.useUtils()
    const createSubmissionMutation = api.evaluationFormSubmissions.createEvalFormSubmission.useMutation({
        onMutate: () => setCreateSubmissionToast(
            toast({
                title: "Loading...",
                description: <Spinner className="w-4 h-4" />,
                duration: 100000,
                variant: "info",
            })
        ),
        onSuccess: ({ evaluationFormSubmission }) => trpcUtils.invalidate().then(() => {
            createSubmissionToast?.update({
                id: createSubmissionToast.id,
                title: "Success",
                description: <Typography>
                    Thank you, You scored {evaluationFormSubmission.rating} of {totalPoints} points With a percentage of {formatPercentage(evaluationFormSubmission.rating / totalPoints * 100)}
                </Typography>,
                variant: "success",
            })
        }),
        onError: ({ message }) => createSubmissionToast?.update({
            id: createSubmissionToast.id,
            title: "An error occured",
            description: message,
            duration: 3000,
            variant: "destructive",
        }),
        onSettled: () => {
            createSubmissionToast?.dismissAfter()
            setCreateSubmissionToast(undefined)
        },
    })

    const handleSubmit = () => {
        createSubmissionMutation.mutate({
            answers: answers.map(answer => ({
                isTrue: answer.answer === "true" ? true : answer.answer === "false" ? false : null,
                questionId: answer.id,
                text: answer.answer !== "true" && answer.answer !== "false" ? answer.answer : null
            })),
            evaluationFormId,
            type: "placementTest",
        })
    }

    return isSubmitted ? (
        <Typography>Submitted Already - {formattedScore}</Typography>
    ) : (
        <Button
            type="button"
            className="relative"
            disabled={!!createSubmissionToast}
            onClick={handleSubmit}
        >
            {!!createSubmissionToast && <Spinner className="w-4 h-4 mr-2" />}
            <Typography>
                {!!createSubmissionToast ? "Loading..." : "Submit"}
            </Typography>
        </Button>
    )
}
