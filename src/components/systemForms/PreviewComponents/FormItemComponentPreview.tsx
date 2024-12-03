import { IFormInput } from "@/components/systemForms/CustomForm";
import { QuestionComponentPreview } from "@/components/systemForms/PreviewComponents/QuestionComponentPreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/Typoghraphy";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";

type FormItemComponentPreviewProps = {
    item: IFormInput["items"][number]
}

export const FormItemComponentPreview: FC<FormItemComponentPreviewProps> = ({ item }) => {
    return (
        <Card key={item.type + item.title + item.questions.length} className="flex flex-col gap-4 p-2">
            <CardHeader className="w-full flex items-start justify-between">
                <CardTitle className={cn("flex flex-col gap-2", item.type === "PageBreakItem" && "text-center w-full")}>
                    {item.title}
                </CardTitle>
                {(item.type === "QuestionGroupItem" || item.type === "QuestionItem" || item.type === "TextItem") && item.questions.map(q => q.points).reduce((a, b) => a + b, 0) > 0 && (
                    <CardDescription className="flex flex-col">
                        <Typography className="whitespace-nowrap">Points: {item.questions.map(q => q.points).reduce((a, b) => a + b, 0)}</Typography>
                    </CardDescription>
                )}
            </CardHeader>
            {item.type !== "PageBreakItem" && (
                <CardContent className="flex flex-col items-stretch gap-4">
                    {(item.type === "ImageItem" || item.type === "QuestionGroupItem" || item.type === "QuestionItem" || item.type === "TextItem")
                        && item.imageUrl && <Image src={item.imageUrl} alt={item.title || ""} width={500} height={500} />}
                    {(item.type === "QuestionGroupItem" || item.type === "QuestionItem") && (
                        <>
                            {item.questions.map((question, i) => (
                                <QuestionComponentPreview
                                    key={`${question.questionText}${i}`}
                                    question={question}
                                />
                            ))}
                        </>
                    )}
                    {item.type === "TextItem" && <Input disabled placeholder="write a short answer" />}
                </CardContent>
            )}
        </Card>
    )
}