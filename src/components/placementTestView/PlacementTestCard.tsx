import { GoogleTestResult } from "@/components/placementTestView/GoogleTestResult"
import { Answer, QuestionComponent } from "@/components/placementTestView/QuestionComponent"
import { SystemTestResult } from "@/components/placementTestView/SystemTestResult"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Typography } from "@/components/ui/Typoghraphy"
import { api } from "@/lib/api"
import { EvaluationFormSubmission, Prisma } from "@prisma/client"
import { FC, useEffect, useState } from "react"

type PlacementTestCardProps = {
    userId: string;
    userEmail: string;
    courseName: string;
    course: Prisma.CourseGetPayload<{
        include: {
            evaluationForms: { include: { questions: true } };
        }
    }>;
    writtenTest: Prisma.EvaluationFormGetPayload<{
        include: {
            googleForm: true,
            questions: true
        }
    }>
}

const PlacementTestCard: FC<PlacementTestCardProps> = ({ userId, userEmail, courseName, writtenTest, course }) => {
    const [answers, setAnswers] = useState<Answer[]>([])
    const [submission, setSubmission] = useState<EvaluationFormSubmission>()
    const [submittedAlready, setSubmittedAlready] = useState<boolean>(false)
    const [googleSubmission, setGoogleSubmission] = useState<{ score: number, isSubmitted: boolean }>({
        isSubmitted: false,
        score: 0,
    })

    const { data: submissionsData } = api.evaluationFormSubmissions.getEvalFormSubmission.useQuery()

    useEffect(() => {
        if (answers.length !== 0) return
        setAnswers(writtenTest.questions.map(question => ({
            id: question.id,
            answer: ""
        })))
    }, [writtenTest])

    useEffect(() => {
        const userSubmission = submissionsData?.submissions.find(submission => submission.userId === userId && submission.evaluationFormId === writtenTest.id)
        setSubmittedAlready(!!userSubmission);
        setSubmission(userSubmission);
    }, [submissionsData?.submissions])

    useEffect(() => {
        const submission = writtenTest.googleForm?.responses.find(res => res.userEmail === userEmail)
        if (!!submission) {
            setSubmittedAlready(true)
            setGoogleSubmission({
                isSubmitted: true,
                score: Number(submission.totalScore),
            })
        }
    }, [writtenTest.googleForm?.responses])

    return (
        <Card className="col-span-12 xl:col-span-8 w-full h-fit">
            <CardHeader>
                <Typography variant={"secondary"}>{courseName} Course Placement Test</Typography>
            </CardHeader>
            <CardContent>
                <Typography variant={"primary"}>{writtenTest?.googleForm?.title}</Typography>
                {writtenTest?.questions.map((question, i) => (
                    <QuestionComponent
                        key={question.id}
                        question={question}
                        index={i}
                        setAnswers={setAnswers}
                        answers={answers}
                        submission={submission}
                    />
                ))}
            </CardContent>
            <CardFooter>
                {writtenTest.googleForm
                    ? !writtenTest?.googleForm?.googleClientId || !writtenTest?.googleFormUrl || !writtenTest.googleForm.formRespondUrl
                        ? (
                            <Skeleton className="h-10 w-10" />
                        ) : (
                            <GoogleTestResult
                                clientId={writtenTest.googleForm.googleClientId}
                                formUrl={writtenTest.googleFormUrl}
                                formRespondUrl={writtenTest.googleForm.formRespondUrl}
                                isSubmitted={googleSubmission.isSubmitted}
                                score={googleSubmission.score}
                                totalPoints={writtenTest.totalPoints}
                            />
                        )
                    : (
                        <SystemTestResult
                            answers={answers}
                            evaluationFormId={writtenTest.id}
                            isSubmitted={submittedAlready}
                            score={submission?.rating || 0}
                            totalPoints={writtenTest.totalPoints}
                        />
                    )}
            </CardFooter>
        </Card >
    )
}

export default PlacementTestCard