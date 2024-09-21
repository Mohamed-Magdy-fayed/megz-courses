import { GoogleTestResult } from "@/components/placementTestView/GoogleTestResult"
import { QuestionComponent } from "@/components/placementTestView/QuestionComponent"
import { SystemTestResult } from "@/components/placementTestView/SystemTestResult"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Typography } from "@/components/ui/Typoghraphy"
import { useEvalformSubmission } from "@/hooks/useEvalFormSubmission"
import { Prisma } from "@prisma/client"
import { FC } from "react"

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

const PlacementTestCard: FC<PlacementTestCardProps> = ({ userId, userEmail, courseName, writtenTest }) => {
    const { googleSubmission, systemSubmission, submittedAlready, answers, setAnswers } = useEvalformSubmission({ userId, userEmail, writtenTest }, [])

    return (
        <Card className="col-span-12 xl:col-span-8 w-full h-fit">
            <CardHeader>
                <Typography variant={"secondary"}>{courseName} Placement Test</Typography>
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
                        submission={systemSubmission}
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
                            score={systemSubmission?.rating || 0}
                            totalPoints={writtenTest.totalPoints}
                        />
                    )}
            </CardFooter>
        </Card >
    )
}

export default PlacementTestCard