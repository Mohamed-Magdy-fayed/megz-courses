import Spinner from "@/components/Spinner"
import { FormItemComponent } from "@/components/systemForms/FormItemComponent"
import { SystemFormResult } from "@/components/systemForms/SystemFormResult"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { useEvalformSubmission } from "@/hooks/useEvalFormSubmission"
import { cn } from "@/lib/utils"
import { Prisma, SystemFormSubmissionAnswer, SystemFormTypes } from "@prisma/client"
import { FC, SetStateAction, useState } from "react"

type SystemFormSubmissionCardProps = {
    isSubmissionView: boolean;
    submissionData: Prisma.SystemFormSubmissionGetPayload<{
        include: {
            student: true, systemForm: {
                include: { items: { include: { questions: { include: { options: true } } } } }
            }
        }
    }>;
    fullWidth?: boolean;
}

type SystemFormCardProps = {
    courseSlug: string;
    formType: SystemFormTypes;
    levelSlug?: string;
    materialItemSlug?: string;
    enabled?: boolean;
    fullWidth?: boolean;
}

type UnionType = SystemFormCardProps | SystemFormSubmissionCardProps

const SystemFormCard: FC<UnionType> = (props) => {
    if ("isSubmissionView" in props) {
        const { systemForm } = props.submissionData

        return (
            <Card className={cn("col-span-12 xl:col-span-8 w-full h-fit", props.fullWidth && "xl:col-span-12")}>
                <CardHeader>
                    <CardTitle>{systemForm?.title}</CardTitle>
                    <CardDescription>{systemForm?.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {systemForm?.items.map(item => (
                        <FormItemComponent
                            key={item.id}
                            item={item}
                            submission={props.submissionData}
                            answers={props.submissionData.answers}
                            setAnswers={() => { }}
                        />
                    ))}
                </CardContent>
                <CardFooter>
                    <SystemFormResult
                        isSubmitted={true}
                        score={props.submissionData?.totalScore || 0}
                        totalScore={systemForm?.totalScore || 0}
                        systemFormId={systemForm?.id || ""}
                        type={systemForm.type}
                        answers={[]}
                    />
                </CardFooter>
            </Card >
        );
    }

    const { systemSubmission, submittedAlready, systemForm, isLoading, error } = useEvalformSubmission({
        ...props
    })

    const [currentAnswers, setCurrentAnswers] = useState<Omit<SystemFormSubmissionAnswer, "isCorrect">[]>([])

    if (error) return <>{error}</>

    return (
        <Card className={cn("col-span-12 xl:col-span-8 w-full h-fit", props.fullWidth && "xl:col-span-12")}>
            <CardHeader>
                <CardTitle>{systemForm?.title}</CardTitle>
                <CardDescription>{systemForm?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {systemForm?.items.map(item => (
                    <FormItemComponent
                        key={item.id}
                        answers={currentAnswers.filter(ans => item.questions.some(q => q.id === ans.questionId))}
                        setAnswers={setCurrentAnswers}
                        item={item}
                        submission={systemSubmission}
                    />
                ))}
            </CardContent>
            <CardFooter>
                {!isLoading ? (
                    <SystemFormResult
                        isSubmitted={submittedAlready || false}
                        score={systemSubmission?.totalScore || 0}
                        totalScore={systemForm?.totalScore || 0}
                        courseSlug={props.courseSlug}
                        levelId={systemForm?.courseLevelId || undefined}
                        systemFormId={systemForm?.id || ""}
                        answers={currentAnswers}
                        type={props.formType}
                    />
                ) : (
                    <Spinner />
                )}
            </CardFooter>
        </Card >
    )
}

export default SystemFormCard