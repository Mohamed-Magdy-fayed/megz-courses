import { useState, useEffect } from "react"
import { Answer } from "@/components/placementTestView/QuestionComponent"
import { api } from "@/lib/api"
import { SubmissionAnswer } from "@prisma/client"
import { UserSubmissionReturnType } from "@/server/api/routers/evaluationFormSubmissions"

type UseEvalformSubmissionProps = {
    courseSlug: string;
    levelSlug?: string;
    materialItemSlug?: string;
    isAssignment?: boolean;
    enabled?: boolean;
}

export const useEvalformSubmission = ({ courseSlug, isAssignment, levelSlug, materialItemSlug, enabled }: UseEvalformSubmissionProps, deps: any[]) => {
    const [systemAnswers, setSystemAnswers] = useState<SubmissionAnswer[] | undefined>([])
    const [answers, setAnswers] = useState<Answer[]>([])
    const [systemForm, setSystemForm] = useState<UserSubmissionReturnType["original"]["systemForm"]>()
    const [systemSubmission, setSystemSubmission] = useState<UserSubmissionReturnType["systemFormSubmission"]>()
    const [submittedAlready, setSubmittedAlready] = useState<boolean>(false)
    const [totalPoints, setTotalPoints] = useState(0)
    const [googleSubmission, setGoogleSubmission] = useState<{ score: number, isSubmitted: boolean } | undefined>({
        isSubmitted: false,
        score: 0,
    })

    const { data: userSubmissionData, isLoading } = api.evaluationFormSubmissions.getUserSubmissionDetails.useQuery({
        courseSlug, isAssignment, levelSlug, materialItemSlug
    }, { enabled })

    useEffect(() => {
        if (!userSubmissionData) return
        setSubmittedAlready(userSubmissionData.isSubmitted)
        setSystemSubmission(userSubmissionData.systemFormSubmission)
        setSystemAnswers(userSubmissionData.original.systemForm?.questions.map(q => ({
            isTrue: true,
            questionId: q.id,
            text: "",
        })) || [])
        setSystemForm(userSubmissionData.original.systemForm)
        setGoogleSubmission({
            isSubmitted: true,
            score: Number(userSubmissionData.googleFormSubmission?.totalScore),
        })
        setTotalPoints(userSubmissionData.original.formFullScore)
    }, [userSubmissionData])

    return {
        submittedAlready,
        systemForm,
        systemSubmission,
        googleSubmission,
        answers,
        setAnswers,
        systemAnswers,
        setSystemAnswers,
        totalPoints,
        isLoading,
    }
}