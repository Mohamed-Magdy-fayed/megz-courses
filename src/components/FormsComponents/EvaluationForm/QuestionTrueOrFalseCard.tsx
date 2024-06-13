import { Typography } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EvaluationFormQuestion, EvaluationFormSubmission, SubmissionAnswer } from "@prisma/client"
import { CheckSquare, XSquare } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

type QuestionTrueOrFalseCardType = {
    question: EvaluationFormQuestion,
    setAnswers: Dispatch<SetStateAction<SubmissionAnswer[] | undefined>>,
    submission?: EvaluationFormSubmission,
    isAnsweredCorrect?: boolean,
}

export const QuestionTrueOrFalseCard = ({ question, setAnswers, isAnsweredCorrect, submission }: QuestionTrueOrFalseCardType) => {
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)

    useEffect(() => {
        setAnswers(prev => prev?.map(questionAnswer => {
            if (question.id === questionAnswer.questionId) return {
                ...questionAnswer,
                isTrue: selectedAnswer,
            }
            return questionAnswer
        }))
    }, [selectedAnswer])

    useEffect(() => {
        if (!submission?.answers) return
        setSelectedAnswer(!!submission.answers.find(answer => answer.questionId === question.id)?.isTrue)
    }, [submission?.answers])

    return (
        <Card className="bg-accent/20">
            <CardHeader>
                <CardTitle>True or False.</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-2">
                    <Button
                        variant={selectedAnswer ? "default" : "outline"}
                        customeColor={!submission
                            ? selectedAnswer
                                ? "muted"
                                : "mutedOutlined"
                            : question.options.some(option => option.isTrue && option.isCorrect)
                                ? selectedAnswer
                                    ? "success"
                                    : "successOutlined"
                                : selectedAnswer
                                    ? "destructive"
                                    : "destructiveOutlined"
                        }
                        className={cn(
                            "flex items-center space-x-2",
                            submission && "pointer-events-none",
                        )}
                        onClick={() => setSelectedAnswer(true)}
                    >
                        <CheckSquare />
                        <Typography>True</Typography>
                    </Button>
                    <Button
                        variant={selectedAnswer === null ? "outline" : selectedAnswer === false ? "default" : "outline"}
                        customeColor={!submission
                            ? selectedAnswer === null
                                ? "mutedOutlined"
                                : selectedAnswer === false ? "muted" : "mutedOutlined"
                            : question.options.some(option => !option.isTrue && option.isCorrect)
                                ? !selectedAnswer
                                    ? "success"
                                    : "successOutlined"
                                : !selectedAnswer
                                    ? "destructive"
                                    : "destructiveOutlined"

                        }
                        className={cn(
                            "flex items-center space-x-2",
                            submission && "pointer-events-none",
                        )}
                        onClick={() => setSelectedAnswer(false)}
                    >
                        <XSquare />
                        <Typography>False</Typography>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}