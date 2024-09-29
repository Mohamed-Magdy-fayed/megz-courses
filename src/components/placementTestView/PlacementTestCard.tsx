import { GoogleTestResult } from "@/components/placementTestView/GoogleTestResult"
import { QuestionComponent } from "@/components/placementTestView/QuestionComponent"
import { SystemTestResult } from "@/components/placementTestView/SystemTestResult"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Typography } from "@/components/ui/Typoghraphy"
import { useEvalformSubmission } from "@/hooks/useEvalFormSubmission"
import { FC } from "react"

type PlacementTestCardProps = {
    courseName: string;
    courseSlug: string;
    enabled: boolean;
}

const PlacementTestCard: FC<PlacementTestCardProps> = ({ courseName, courseSlug, enabled }) => {
    
    const { googleSubmission, systemSubmission, submittedAlready, answers, setAnswers, systemForm } = useEvalformSubmission({
        courseSlug,
        enabled,
    }, [])

    return (
        <Card className="col-span-12 xl:col-span-8 w-full h-fit">
            <CardHeader>
                <Typography variant={"secondary"}>{courseName} Placement Test</Typography>
            </CardHeader>
            <CardContent>
                <Typography variant={"primary"}>{systemForm?.googleForm?.title || systemForm?.materialItem?.title}</Typography>
                {systemForm?.questions.map((question, i) => (
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
                {systemForm?.googleForm
                    ? !systemForm?.googleForm?.googleClientId || !systemForm?.googleFormUrl || !systemForm.googleForm.formRespondUrl
                        ? (
                            <Skeleton className="h-10 w-10" />
                        ) : (
                            <GoogleTestResult
                                clientId={systemForm.googleForm.googleClientId}
                                formUrl={systemForm.googleFormUrl}
                                formRespondUrl={systemForm.googleForm.formRespondUrl}
                                isSubmitted={!!googleSubmission?.isSubmitted}
                                score={googleSubmission?.score || 0}
                                totalPoints={systemForm.totalPoints}
                            />
                        )
                    : systemForm?.id && (
                        <SystemTestResult
                            answers={answers}
                            evaluationFormId={systemForm.id}
                            isSubmitted={submittedAlready}
                            score={systemSubmission?.rating || 0}
                            totalPoints={systemForm.totalPoints}
                        />
                    )}
            </CardFooter>
        </Card >
    )
}

export default PlacementTestCard