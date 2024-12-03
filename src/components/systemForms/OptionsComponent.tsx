import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ItemQuestionOption, Prisma, SystemFormSubmissionAnswer } from "@prisma/client";
import { CheckSquare } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";

type OptionsComponentProps = {
    questionId: string
    option: ItemQuestionOption
    index: number
    submission?: Prisma.SystemFormSubmissionGetPayload<{ include: { student: true } }>
    answer?: Omit<SystemFormSubmissionAnswer, "isCorrect">
    setAnswers: Dispatch<SetStateAction<Omit<SystemFormSubmissionAnswer, "isCorrect">[]>>
}

export const OptionsComponent: FC<OptionsComponentProps> = ({ index, option, setAnswers, questionId, answer, submission }) => {
    const isSelectedAnswer = answer?.selectedAnswers.some((answer) => answer === option.value)
    const isSubmitted = !!submission
    const selectedAnswers = isSubmitted ? submission.answers.find(ans => ans.questionId === questionId)?.selectedAnswers : []


    return (
        <div key={`${option.value}${index}`}>
            <Button
                disabled={isSubmitted}
                variant={"outline"}
                customeColor={"primaryOutlined"}
                className={cn(isSelectedAnswer && "bg-primary text-primary-foreground", (isSubmitted && option.isCorrect) && "bg-success text-success-foreground border-success")}
                onClick={() => setAnswers((prev) => {
                    if (!prev.some(ans => ans.questionId === questionId)) return [...prev, { questionId, textAnswer: "", selectedAnswers: [option.value] }]
                    return (prev.map(answer => answer.questionId === questionId ? {
                        ...answer,
                        selectedAnswers: answer.selectedAnswers.includes(option.value) ? answer.selectedAnswers.filter(ans => option.value !== ans) : [...answer.selectedAnswers, option.value],
                    } : answer))
                })}
            >
                {isSelectedAnswer && <CheckSquare className="w-4 h-4 mr-2" />} {option.value}
            </Button>
        </div >
    )
}