import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { EvaluationFormQuestion, EvaluationFormSubmission, SubmissionAnswer } from "@prisma/client"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

type QuestionAnswersCardType = {
    question: EvaluationFormQuestion,
    setAnswers: Dispatch<SetStateAction<SubmissionAnswer[] | undefined>>,
    submission?: EvaluationFormSubmission,
    isAnsweredCorrect?: boolean
}

export const QuestionAnswersCard = ({ question, setAnswers, submission, isAnsweredCorrect }: QuestionAnswersCardType) => {
    const [selectedAnswer, setSelectedAnswer] = useState("")

    useEffect(() => {
        setAnswers(prev => {
            console.log(prev?.map(questionAnswer => {
                if (question.id === questionAnswer.questionId) return {
                    ...questionAnswer,
                    text: selectedAnswer,
                }
                return questionAnswer
            }));
            return prev?.map(questionAnswer => {
                if (question.id === questionAnswer.questionId) return {
                    ...questionAnswer,
                    text: selectedAnswer,
                }
                return questionAnswer
            })
        })
        console.log(selectedAnswer);

    }, [selectedAnswer])

    useEffect(() => {
        if (!submission?.answers) return
        setSelectedAnswer(submission.answers.find(answer => answer.questionId === question.id)?.text || "")
    }, [submission?.answers])

    return (
        <Card className="bg-accent/20">
            <CardHeader>
                <CardTitle>Choose the correct answer.</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={selectedAnswer} className="flex items-center justify-around flex-wrap">
                    {question.options.map((option, index) => (
                        <Button
                            key={`${option.text}option${index}`}
                            variant={"outline"}
                            customeColor={!submission ? "mutedOutlined" : option.isCorrect ? "successOutlined" : "destructiveOutlined"}
                            className={cn(submission && "pointer-events-none")}
                            asChild
                        >
                            <div
                                onClick={() => setSelectedAnswer(option.text || "")}
                                className="flex items-center space-x-2 [&>*]:pointer-events-none cursor-pointer"
                            >
                                <RadioGroupItem value={option.text || ""} id={option.text || ""} />
                                <Label htmlFor={option.text || ""}>{option.text}</Label>
                            </div>
                        </Button>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    )
}