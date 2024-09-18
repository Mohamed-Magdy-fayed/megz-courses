import { Dispatch, FC, SetStateAction } from "react"
import { Answer } from "@/components/placementTestView/QuestionComponent"
import { EvaluationFormSubmission } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TrueAndFalseComponentProps = {
    questionId: string
    answers: Answer[]
    submission: EvaluationFormSubmission | undefined
    setAnswers: Dispatch<SetStateAction<Answer[]>>
}

export const TrueAndFalseComponent: FC<TrueAndFalseComponentProps> = ({ setAnswers, questionId, answers, submission }) => {
    const isTrueAnswer = answers.some(({ id, answer }) => id === questionId && answer === "true")
    const isFalseAnswer = answers.some(({ id, answer }) => id === questionId && answer === "false")
    const isSubmitted = !!submission
    const selectedAnswer = isSubmitted && submission.answers.find((answer) => answer.questionId === questionId)?.isTrue ? "true" : "false"

    return (
        <div className="flex items-center gap-4">
            <Button
                variant={"outline"}
                disabled={isSubmitted}
                customeColor={"successOutlined"}
                className={cn((isTrueAnswer || (isSubmitted && selectedAnswer === "true")) && "bg-success text-success-foreground")}
                onClick={() => setAnswers((prev) => prev.map(question => question.id === questionId ? {
                    ...question,
                    answer: "true"
                } : question))}
            >
                True
            </Button>
            <Button
                variant={"outline"}
                disabled={isSubmitted}
                customeColor={"destructiveOutlined"}
                className={cn((isFalseAnswer || (isSubmitted && selectedAnswer === "false")) && "bg-destructive text-destructive-foreground")}
                onClick={() => setAnswers((prev) => prev.map(question => question.id === questionId ? {
                    ...question,
                    answer: "false"
                } : question))}
            >
                False
            </Button>
        </div>
    )
}