import { SeverityPill } from "@/components/overview/SeverityPill"
import { PaperContainer } from "@/components/ui/PaperContainers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, SubmissionAnswer } from "@prisma/client"
import { ZoomIn } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { QuestionAnswersCard } from "./QuestionAnswersCard"
import { QuestionTrueOrFalseCard } from "./QuestionTrueOrFalseCard"
import { cn, isQuestionCorrect } from "@/lib/utils"

type EvaluationFormQuestionCardType = {
    question: EvaluationFormQuestion,
    index: number,
    setAnswers: Dispatch<SetStateAction<SubmissionAnswer[] | undefined>>,
    setDescription: Dispatch<SetStateAction<string>>,
    setImage: Dispatch<SetStateAction<string>>,
    setIsImageModalOpen: Dispatch<SetStateAction<boolean>>,
    isSubmitted: boolean,
    submission?: EvaluationFormSubmission,
    totalPoints: number,
    score: number,
    evaluationForm: EvaluationForm,
}

export const EvaluationFormQuestionCard = ({
    index,
    question,
    setAnswers,
    setDescription,
    setImage,
    setIsImageModalOpen,
    isSubmitted,
    submission,
    score,
    totalPoints,
    evaluationForm,
}: EvaluationFormQuestionCardType) => {
    return (
        <PaperContainer
            key={`${question.questionText}PaperContainer${index}`}
            className="flex flex-col gap-4"
        >
            <SeverityPill
                color={!isSubmitted || !submission ? "info" : isQuestionCorrect(question, submission) ? "success" : "destructive"}
                className="w-fit self-end"
            >
                Points: {question.points}
            </SeverityPill>
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <Card
                    className={cn("bg-no-repeat bg-center bg-cover md:flex-grow", question.image && "h-60")}
                    style={{ backgroundImage: `url(${question.image})` }}
                >
                    <CardHeader className={cn("flex justify-between bg-accent/80 text-accent-foreground", !question.image && "h-full")}>
                        <CardTitle>{question.questionText}</CardTitle>
                    </CardHeader>
                    {question.image && (
                        <CardContent
                            className="group grid place-content-center h-full hover:bg-accent/20 cursor-pointer"
                            onClick={() => {
                                setDescription(question.questionText)
                                setImage(question.image ?? "")
                                setIsImageModalOpen(true)
                            }}
                        >
                            <Button
                                variant={"icon"}
                                customeColor={"infoIcon"}
                                className="opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all pointer-events-none"
                            >
                                <ZoomIn className="rounded-full" size={50} />
                            </Button>
                        </CardContent>
                    )}
                </Card>
                {
                    question.type === "multipleChoice"
                        ? <QuestionAnswersCard submission={submission && submission} isAnsweredCorrect={submission && isQuestionCorrect(question, submission)} question={question} setAnswers={setAnswers} />
                        : <QuestionTrueOrFalseCard submission={submission && submission} isAnsweredCorrect={submission && isQuestionCorrect(question, submission)} question={question} setAnswers={setAnswers} />
                }
            </div>
        </PaperContainer>
    )
}