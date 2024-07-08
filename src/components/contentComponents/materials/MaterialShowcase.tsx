import ControlledPracticeContainer from "@/components/materialsShowcaseComponents/ControlledPracticeContainer";
import FirstTestContainer from "@/components/materialsShowcaseComponents/FirstTestContainer";
import TeachingContainer from "@/components/materialsShowcaseComponents/TeachingContainer";
import { Typography } from "@/components/ui/Typoghraphy";
import { cn } from "@/lib/utils";
import { useDraggingStore } from "@/zustand/store";
import { MaterialItem } from "@prisma/client";
import { FC } from "react";

type MaterialShowcaseProps = {
    materialItem: MaterialItem
}

const MaterialShowcase: FC<MaterialShowcaseProps> = ({ materialItem }) => {
    const { submission } = useDraggingStore();

    if (materialItem.type === "upload") return (
        <>CommingSoon</>
    )

    return (
        <div>
            <div className="flex flex-col items-center p-4">
                <Typography className="text-center text-2xl font-bold">
                    {materialItem.manual?.leadinText}
                </Typography>
                <img src={materialItem.manual?.leadinImageUrl} className="max-h-[50vh] object-cover" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-col items-center whitespace-nowrap p-4">
                    <Typography className="w-full text-left text-4xl font-bold text-cyan-600">
                        {materialItem.manual?.title}
                    </Typography>
                    <Typography className="w-full text-left text-base text-warning">
                        {materialItem.manual?.subTitle}
                    </Typography>
                </div>
                {submission.completed && (
                    <div className="flex flex-col gap-2 whitespace-nowrap p-4 [&>*]:text-sm">
                        <Typography
                            className={cn(
                                "",
                                submission.highestScore > 50 ? "text-success" : "text-error"
                            )}
                        >
                            HighestScore: {submission.highestScore.toFixed(2)}%
                        </Typography>
                        <Typography>Attempts: {submission.attempts}</Typography>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center p-4">
                <Typography className="text-center text-2xl font-bold">{ }</Typography>
                <div className="flex flex-col gap-4">
                    <FirstTestContainer
                        DBcards={materialItem.manual?.answerCards!}
                        DBareas={materialItem.manual?.answerAreas!}
                        firstTestTitle={materialItem.manual?.firstTestTitle!}
                    />
                    <TeachingContainer vocabularyCards={materialItem.manual?.vocabularyCards!} />
                    <ControlledPracticeContainer practiceQuestions={materialItem.manual?.practiceQuestions!} />
                </div>
            </div>
        </div>
    )
}

export default MaterialShowcase