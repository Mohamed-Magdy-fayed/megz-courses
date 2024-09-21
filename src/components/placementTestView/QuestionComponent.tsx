import { OptionsComponent } from "@/components/placementTestView/OptionsComponent";
import { TrueAndFalseComponent } from "@/components/placementTestView/TrueAndFalseComponent";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/Typoghraphy";
import { EvaluationFormQuestion, EvaluationFormSubmission } from "@prisma/client";
import { Dispatch, FC, SetStateAction } from "react";

export type Answer = {
    id: string;
    answer: string;
}

type QuestionComponentProps = {
    question: EvaluationFormQuestion
    index: number
    submission: EvaluationFormSubmission | undefined
    answers: Answer[]
    setAnswers: Dispatch<SetStateAction<Answer[]>>
}

export const QuestionComponent: FC<QuestionComponentProps> = ({ question, index, setAnswers, answers, submission }) => {
    return (
        <div key={question.id} className="flex flex-col gap-4 p-2">
            <div className="w-full flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <Typography>Question {index + 1}</Typography>
                </div>
                <div className="flex flex-col">
                    <Typography className="whitespace-nowrap">Points: {question.points}</Typography>
                    <Typography className="whitespace-nowrap">{question.type === "multipleChoice" ? "Choose the correct answer" : "True or False"}</Typography>
                </div>
            </div>
            <Typography variant={"primary"}>{question.questionText}</Typography>
            <div className="flex items-center justify-between flex-wrap">
                {question.type === "multipleChoice" && question.options.map((option, index) => (
                    <OptionsComponent
                        key={`${option.text}_${index}`}
                        questionId={question.id}
                        option={option}
                        index={index}
                        setAnswers={setAnswers}
                        answers={answers}
                        submission={submission}
                    />
                ))}
                {question.type === "trueFalse" && (
                    <TrueAndFalseComponent
                        questionId={question.id}
                        setAnswers={setAnswers}
                        answers={answers}
                        submission={submission}
                    />
                )}
            </div>
            <Separator />
        </div>
    )
}