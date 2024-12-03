import { QuestionComponent } from "@/components/systemForms/QuestionComponent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/Typoghraphy";
import { cn } from "@/lib/utils";
import { Prisma, SystemFormSubmissionAnswer } from "@prisma/client";
import Image from "next/image";
import { Dispatch, FC, SetStateAction } from "react";

type FormItemComponentProps = {
    item: Prisma.SystemFormItemGetPayload<{ include: { questions: { include: { options: true } } } }>
    submission?: Prisma.SystemFormSubmissionGetPayload<{ include: { student: true } }>
    answers: Omit<SystemFormSubmissionAnswer, "isCorrect">[]
    setAnswers: Dispatch<SetStateAction<Omit<SystemFormSubmissionAnswer, "isCorrect">[]>>
}

export const FormItemComponent: FC<FormItemComponentProps> = ({ item, setAnswers, answers, submission }) => {
    return (
        <Card key={item.id} className="flex flex-col gap-4 p-2">
            <CardHeader className="w-full flex items-start justify-between">
                <CardTitle className={cn("flex flex-col gap-2", item.type === "PageBreakItem" && "text-center w-full")}>
                    <Typography variant={"secondary"}>{item.title}</Typography>
                </CardTitle>
                {(item.type === "QuestionGroupItem" || item.type === "QuestionItem" || item.type === "TextItem") && item.questions.map(q => q.points).reduce((a, b) => a + b, 0) > 0 && (
                    <CardDescription className="flex flex-col">
                        <Typography className={cn("whitespace-nowrap", !!submission ? submission.answers.find(ans => item.questions.some(({ id }) => id === ans.questionId))?.isCorrect ? "text-success" : "text-destructive" : "")}>Points: {item.questions.map(q => q.points).reduce((a, b) => a + b, 0)}</Typography>
                    </CardDescription>
                )}
            </CardHeader>
            {item.type !== "PageBreakItem" && (
                <CardContent className="flex flex-col items-stretch gap-4">
                    {(item.type === "ImageItem" || item.type === "QuestionGroupItem" || item.type === "QuestionItem" || item.type === "TextItem")
                        && item.imageUrl && <Image src={item.imageUrl} alt={item.title || ""} width={500} height={500} />}
                    {(item.type === "QuestionGroupItem" || item.type === "QuestionItem") &&
                        item.questions.map((question) => (
                            <QuestionComponent
                                key={question.id}
                                question={question}
                                setAnswers={setAnswers}
                                answer={answers.find(ans => ans.questionId === question.id)}
                                submission={submission}
                            />
                        ))}
                </CardContent>
            )}
        </Card>
    )
}