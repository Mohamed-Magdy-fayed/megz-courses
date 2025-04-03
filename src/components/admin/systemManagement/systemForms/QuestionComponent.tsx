import { OptionsComponent } from "@/components/admin/systemManagement/systemForms/OptionsComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { Prisma, SystemFormSubmissionAnswer } from "@prisma/client";
import { Dispatch, FC, SetStateAction } from "react";

type QuestionComponentProps = {
    question: Prisma.ItemQuestionGetPayload<{ include: { options: true } }>
    submission?: Prisma.SystemFormSubmissionGetPayload<{ include: { student: true } }>
    answer?: Omit<SystemFormSubmissionAnswer, "isCorrect">
    setAnswers: Dispatch<SetStateAction<Omit<SystemFormSubmissionAnswer, "isCorrect">[]>>
}

export const QuestionComponent: FC<QuestionComponentProps> = ({ question, setAnswers, answer, submission }) => {
    return (
        <div key={question.id} className="flex flex-col gap-4 p-2">
            <div className="w-full flex items-start justify-between">
                {!!question.questionText && (
                    <Typography>
                        {question.questionText}
                    </Typography>
                )}
                {question.points > 0 && (
                    <div className="flex flex-col">
                        <Typography className="whitespace-nowrap">Points: {question.points}</Typography>
                        {question.type === "Choice" && <Typography className="whitespace-nowrap">Choose the correct answer</Typography>}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between flex-wrap">
                {question.type === "Choice" ? question.options.map((option, index) => (
                    <OptionsComponent
                        key={option.id}
                        questionId={question.id}
                        option={option}
                        index={index}
                        setAnswers={setAnswers}
                        answer={answer}
                        submission={submission}
                    />
                )) : question.type === "Text" ? <Input
                    value={answer?.textAnswer || ""}
                    disabled={!!submission}
                    placeholder={"Write a short answer"}
                    onChange={(e) => setAnswers(prev => {
                        if (!prev.some(ans => ans.questionId === question.id)) return [...prev, { questionId: question.id, textAnswer: e.target.value, selectedAnswers: [] }]
                        return [...prev.map(ans => ans.questionId === question.id
                            ? { ...ans, textAnswer: e.target.value }
                            : { ...ans })]
                    })
                    }
                /> : null}
            </div>
        </div>
    )
}