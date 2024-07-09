import Spinner from "@/components/Spinner"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { getInitials } from "@/lib/getInitials"
import { cn, formatPercentage } from "@/lib/utils"
import { EvaluationForm, EvaluationFormQuestion, EvaluationFormSubmission, Option } from "@prisma/client"
import { format, subHours } from "date-fns"
import { CheckSquare } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"

type Answer = {
    id: string;
    answer: string;
}

const CoursePlacementTestPage = () => {
    const router = useRouter()
    const id = router.query.courseId as string

    const userId = useSession().data?.user.id

    const { toast, toastError } = useToast()

    const trpcUtils = api.useContext()

    const { data } = api.courses.getById.useQuery({ id })
    const { data: submissionsData } = api.evaluationFormSubmissions.getEvalFormSubmission.useQuery()
    const { data: scheduleData } = api.placementTests.getUserCoursePlacementTest.useQuery({ courseId: id })

    const createSubmissionMutation = api.evaluationFormSubmissions.createEvalFormSubmission.useMutation({
        onMutate: () => {
            setCreateSubmissionToast(
                toast({
                    title: "Loading...",
                    description: <Spinner />,
                    duration: 100000,
                    variant: "info",
                })
            )
            setLoading(true)
        },
        onSuccess: ({ evaluationFormSubmission }) => createSubmissionToast?.update({
            id: createSubmissionToast.id,
            title: "Success",
            description: <Typography>
                Thank you, You scored {evaluationFormSubmission.rating} of {evaluationForm?.totalPoints} points With a percentage of {formatPercentage(evaluationFormSubmission.rating / evaluationForm?.totalPoints! * 100)}
            </Typography>,
            duration: 3000,
            variant: "success",
        }),
        onError: ({ message }) => createSubmissionToast?.update({
            id: createSubmissionToast.id,
            title: "An error occured",
            description: message,
            duration: 3000,
            variant: "destructive",
        }),
        onSettled: () => {
            trpcUtils.invalidate().then(() => {
                setLoading(false)
            })
        },
    })

    const isOralTestTimePassed = (scheduleData?.placementTest?.oralTestTime.testTime.getDay() || 32) < new Date().getDay()

    const [submittedAlready, setSubmittedAlready] = useState<boolean>(false)
    const [submission, setSubmission] = useState<EvaluationFormSubmission>()
    const [loading, setLoading] = useState<boolean>(false)
    const [createSubmissionToast, setCreateSubmissionToast] = useState<toastType>()
    const [answers, setAnswers] = useState<Answer[]>([])
    const [evaluationForm, setEvaluationForm] = useState<EvaluationForm & {
        questions: EvaluationFormQuestion[];
    }>()

    useEffect(() => {
        if (answers.length !== 0) return
        const test = data?.course?.evaluationForms.filter(form => form.type === "placementTest")[0]
        if (!test) return
        setAnswers(test.questions.map(question => ({
            id: question.id,
            answer: ""
        })))
        setEvaluationForm(test)
    }, [data?.course?.evaluationForms.filter(form => form.type === "placementTest")[0]])

    useEffect(() => {
        setSubmittedAlready(submissionsData?.submissions.some(submission => submission.userId === userId) ? true : false);
        setSubmission(submissionsData?.submissions.find(submission => submission.userId === userId));
    }, [submissionsData?.submissions])

    const handleSubmit = () => {
        console.log(answers)
        data?.course?.evaluationForms.find(form => form.type === "placementTest")?.questions.map(question => {
            question.type === "multipleChoice" && console.log(answers.find(answer => answer.id === question.id)?.answer === question.options.find(option => option.isCorrect)?.text ? `question ${question.questionText} is Correct` : `question ${question.questionText} is NOT Correct`);
            question.type === "trueFalse" && console.log(answers.find(answer => answer.id === question.id)?.answer === (question.options.find(option => option.isCorrect)?.isTrue ? "true" : "false") ? `question ${question.questionText} is Correct` : `question ${question.questionText} is NOT Correct`);
        })

        const evaluationFormlId = data?.course?.evaluationForms.find(form => form.type === "placementTest")?.id
        if (!evaluationFormlId) return toastError("form id not existing!")

        createSubmissionMutation.mutate({
            answers: answers.map(answer => ({
                isTrue: answer.answer === "true" ? true : answer.answer === "false" ? false : null,
                questionId: answer.id,
                text: answer.answer !== "true" && answer.answer !== "false" ? answer.answer : null
            })),
            evaluationFormlId,
            type: "placementTest",
        })
    }

    if (!data?.course) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <LandingLayout>
            <ConceptTitle className="mb-8">Placement Test</ConceptTitle>
            <div className="w-full grid justify-items-center gap-4 grid-cols-12">
                <Card className="col-span-12 xl:col-span-4 w-full h-fit">
                    <CardHeader>
                        <Typography variant={"secondary"}>{data.course.name} Course Oral Test</Typography>
                    </CardHeader>
                    {scheduleData?.placementTest ? (
                        <CardContent className="space-y-4">
                            <Typography variant={"secondary"}>Test Time: </Typography>
                            <Typography>{format(scheduleData.placementTest.oralTestTime.testTime, "PPPPp")}</Typography>
                            <Separator />
                            <div className="flex flex-col gap-4">
                                <Typography variant={"secondary"}>Trainer Information</Typography>
                                <div className="flex items-center gap-2" >
                                    <Avatar>
                                        <AvatarImage src={`${scheduleData.placementTest.trainer.user.image}`} />
                                        <AvatarFallback>
                                            {getInitials(`${scheduleData.placementTest.trainer.user.name}`)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-2">
                                        <Typography variant={"primary"}>
                                            {scheduleData.placementTest.trainer.user.name}
                                        </Typography>
                                        <Typography variant={"secondary"}>
                                            {scheduleData.placementTest.trainer.user.email}
                                        </Typography>
                                        <Typography variant={"secondary"}>
                                            {scheduleData.placementTest.trainer.user.phone}
                                        </Typography>
                                    </div>
                                </div>
                                <Separator />
                            </div>
                        </CardContent>
                    ) : (
                        <CardContent>
                            Not yet Scheduled
                        </CardContent>
                    )}
                    <CardFooter>
                        <Button disabled={isOralTestTimePassed}>Join Meeting</Button>
                    </CardFooter>
                </Card>
                <Card className="col-span-12 xl:col-span-8 w-full h-fit">
                    <CardHeader>
                        <Typography variant={"secondary"}>{data.course.name} Course Placement Test</Typography>
                    </CardHeader>
                    <CardContent>
                        {data.course.evaluationForms.find(form => form.type === "placementTest")?.questions.map((question, i) => (
                            <QuestionComponent
                                key={question.id}
                                question={question}
                                index={i}
                                setAnswers={setAnswers}
                                answers={answers}
                                submission={submission}
                            />
                        ))}
                    </CardContent>
                    <CardFooter>
                        {submittedAlready
                            ? (
                                <Typography>Submitted Already - {formatPercentage(submission?.rating! / evaluationForm?.totalPoints! * 100)}</Typography>
                            )
                            : (
                                <Button
                                    type="button"
                                    className="relative"
                                    disabled={loading}
                                    onClick={handleSubmit}
                                >
                                    {loading && <Spinner className="w-4 h-4 mr-2" />}
                                    <Typography>
                                        {loading ? "Loading..." : "Submit"}
                                    </Typography>
                                </Button>
                            )}
                    </CardFooter>
                </Card>
            </div>
        </LandingLayout >
    )
}

export default CoursePlacementTestPage

type QuestionComponentProps = {
    question: EvaluationFormQuestion
    index: number
    submission: EvaluationFormSubmission | undefined
    answers: Answer[]
    setAnswers: Dispatch<SetStateAction<Answer[]>>
}

const QuestionComponent: FC<QuestionComponentProps> = ({ question, index, setAnswers, answers, submission }) => {

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

const OptionsComponent: FC<OptionsComponentProps> = ({ index, option, setAnswers, questionId, answers, submission }) => {
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

type TrueAndFalseComponentProps = {
    questionId: string
    answers: Answer[]
    submission: EvaluationFormSubmission | undefined
    setAnswers: Dispatch<SetStateAction<Answer[]>>
}

const TrueAndFalseComponent: FC<TrueAndFalseComponentProps> = ({ setAnswers, questionId, answers, submission }) => {
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