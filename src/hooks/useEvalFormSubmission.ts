import { useState, useEffect } from "react"
import { Answer } from "@/components/placementTestView/QuestionComponent"
import { api } from "@/lib/api"
import { EvaluationFormSubmission, Prisma, SubmissionAnswer } from "@prisma/client"

type UseEvalformSubmissionProps = {
    userId: string;
    userEmail: string;
    writtenTest?: Prisma.EvaluationFormGetPayload<{
        include: {
            googleForm: true,
            questions: true
        }
    }> | null
}

export const useEvalformSubmission = ({ userEmail, userId, writtenTest }: UseEvalformSubmissionProps, deps: any[]) => {
    const [systemAnswers, setSystemAnswers] = useState<SubmissionAnswer[] | undefined>([])
    const [answers, setAnswers] = useState<Answer[]>([])
    const [systemSubmission, setSystemSubmission] = useState<EvaluationFormSubmission>()
    const [submittedAlready, setSubmittedAlready] = useState<boolean>(false)
    const [totalPoints, setTotalPoints] = useState(0)
    const [googleSubmission, setGoogleSubmission] = useState<{ score: number, isSubmitted: boolean }>({
        isSubmitted: false,
        score: 0,
    })

    const { data: submissionsData, isLoading } = api.evaluationFormSubmissions.getUserEvalFormSubmission.useQuery()

    useEffect(() => {
        if (!writtenTest) return;
        const total = writtenTest.questions.reduce((sum, { points }) => sum + points, 0);
        setTotalPoints(total);

        setAnswers(writtenTest.questions.map(q => ({
            id: q.id,
            answer: "",
        })))

        // Handle submissions based on userId and evaluation form
        const userSubmission = submissionsData?.submissions.find(
            ({ userId: submissionUserId, evaluationFormId }) =>
                submissionUserId === userId && evaluationFormId === writtenTest.id
        );
        setSubmittedAlready(!!userSubmission);
        setSystemSubmission(userSubmission);

        // Handle Google form submissions
        const googleSubmission = writtenTest.googleForm?.responses.find(
            res => res.userEmail === userEmail
        );
        if (googleSubmission) {
            setSubmittedAlready(true);
            setGoogleSubmission({
                isSubmitted: true,
                score: Number(googleSubmission.totalScore),
            });
        }
    }, [writtenTest, submissionsData?.submissions, userId, answers.length, userEmail, ...deps]);


    return {
        submittedAlready,
        systemSubmission,
        googleSubmission,
        systemAnswers,
        setAnswers,
        answers,
        setSystemAnswers,
        totalPoints,
        isLoading,
    }
}