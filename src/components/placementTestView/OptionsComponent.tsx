import { Answer } from "@/components/placementTestView/QuestionComponent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EvaluationFormSubmission, Option } from "@prisma/client";
import { CheckSquare } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";

type OptionsComponentProps = {
    questionId: string
    option: Option
    index: number
    submission: EvaluationFormSubmission | undefined
    answers: Answer[]
    setAnswers: Dispatch<SetStateAction<{
        id: string;
        answer: string;
    }[]>>
}

export const OptionsComponent: FC<OptionsComponentProps> = ({ index, option, setAnswers, questionId, answers, submission }) => {
    const isSelectedAnswer = answers.some(({ id, answer }) => id === questionId && answer === option.text)
    const isSubmitted = !!submission
    const selectedAnswer = isSubmitted ? submission.answers.find((answer) => answer.questionId === questionId)?.text : null

    return (
        <div key={`${option.text}${index}`}>
            <Button
                disabled={isSubmitted}
                variant={"outline"}
                customeColor={"primaryOutlined"}
                className={cn((isSelectedAnswer || (isSubmitted && selectedAnswer === option.text)) && "bg-primary text-primary-foreground")}
                onClick={() => setAnswers((prev) => (prev.map(question => question.id === questionId ? {
                    ...question,
                    answer: option.text || "",
                } : question)))}
            >
                {isSelectedAnswer && <CheckSquare className="w-4 h-4 mr-2" />} {option.text}
            </Button>
        </div >
    )
}