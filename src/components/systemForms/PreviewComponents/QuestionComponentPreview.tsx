import { IFormInput } from "@/components/systemForms/CustomForm";
import { OptionsComponentPreview } from "@/components/systemForms/PreviewComponents/OptionsComponentPreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { FC } from "react";

type QuestionComponentPreviewProps = {
    question: IFormInput["items"][number]["questions"][number]
}

export const QuestionComponentPreview: FC<QuestionComponentPreviewProps> = ({ question }) => {
    return (
        <Card key={question.type + question.questionText + question.points} className="flex flex-col gap-4 p-2 w-full">
            <CardHeader className="w-full flex items-start justify-between">
                <CardTitle className="flex flex-col gap-2">
                    {question.questionText}
                </CardTitle>
                <CardDescription className="flex flex-col">
                    {question.points > 0 && <Typography className="whitespace-nowrap">Points: {question.points}</Typography>}
                    <Typography className="whitespace-nowrap">{question.type === "Choice" ? "Choose the correct answer" : "Write a short answer"}</Typography>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between flex-wrap gap-4 w-full">
                {question.type === "Choice" ? question.options.map((option, index) => (
                    <OptionsComponentPreview
                        key={`${option.value}${index}`}
                        option={option}
                        index={index}
                    />
                )) : <Input
                    value={""}
                />}
            </CardContent>
        </Card>
    )
}