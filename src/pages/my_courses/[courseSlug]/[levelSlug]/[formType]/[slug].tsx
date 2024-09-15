import { EvaluationFormQuestionCard } from "@/components/FormsComponents/EvaluationForm/EvaluationFormQuestionCard";
import Spinner from "@/components/Spinner";
import LearningLayout from "@/components/LearningLayout/LearningLayout";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";
import { cn, getEvalutaionFormFullMark, getEvalutaionStatus } from "@/lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EvaluationFormSubmission, SubmissionAnswer } from "@prisma/client";
import { SeverityPill } from "@/components/overview/SeverityPill";
import Link from "next/link";

const AssignmentPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const slug = router.query.slug as string
    const type = router.query.formType as string
    const { toastError, toastSuccess } = useToast()
    const trpcUtils = api.useContext()
    const courseQuery = api.courses.getBySlug.useQuery({ slug: courseSlug })
    const evalFormQuery = api.evaluationForm.getEvalFormByMaterialItemSlug.useQuery({ slug, type: type === "assignment" ? "assignment" : type === "quiz" ? "quiz" : undefined })
    const userQuery = api.users.getCurrentUser.useQuery()
    const submitMutation = api.evaluationFormSubmissions.createEvalFormSubmission.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ evaluationFormSubmission }) => evaluationFormSubmission.rating > getEvalutaionFormFullMark(evalFormQuery.data?.evaluationForm?.questions!) / 2
            ? toastSuccess(`Thank you, your score is ${evaluationFormSubmission.rating}`)
            : toastError(`Thank you, your score is ${evaluationFormSubmission.rating}`),
        onError: ({ message }) => toastError(message),
        onSettled: () => {
            trpcUtils.invalidate()
                .then(() => setLoading(false))
        },
    })

    const [score, setScore] = useState(0)
    const [totalPoints, setTotalPoints] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [submission, setSubmission] = useState<EvaluationFormSubmission>()
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [loading, setLoading] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [answers, setAnswers] = useState<SubmissionAnswer[] | undefined>()

    const handleSubmit = () => {
        if (!answers) return toastError("no answers!")
        if (!evalFormQuery.data?.evaluationForm?.type) return toastError("no form type!")
        if (!courseQuery?.data?.course?.id) return toastError("no course!")

        submitMutation.mutate({
            answers,
            evaluationFormId: evalFormQuery.data.evaluationForm.id,
            type: evalFormQuery.data.evaluationForm.type,
            courseId: courseQuery.data.course.id,
        })
    }

    useEffect(() => {
        if (!evalFormQuery.data?.evaluationForm?.questions) return
        setAnswers(evalFormQuery.data.evaluationForm.questions.map(({ id }) => ({ questionId: id, isTrue: null, text: null })))
        setTotalPoints(evalFormQuery.data.evaluationForm.questions.map(q => q.points).reduce((a, b) => a + b, 0))
    }, [evalFormQuery.data?.evaluationForm])

    useEffect(() => {
        if (!userQuery.data?.user) return
        if (!evalFormQuery?.data?.evaluationForm?.id) return
        setIsSubmitted(userQuery.data.user.evaluationFormSubmissions.some(submission => submission.evaluationFormId === evalFormQuery.data.evaluationForm?.id))
        setScore(userQuery.data.user.evaluationFormSubmissions.find(submission => submission.evaluationFormId === evalFormQuery.data.evaluationForm?.id)?.rating || 0)
        setSubmission(userQuery.data.user.evaluationFormSubmissions.find(submission => submission.evaluationFormId === evalFormQuery.data.evaluationForm?.id))
    }, [userQuery.data?.user])

    if (evalFormQuery.isLoading || !evalFormQuery.data?.evaluationForm) return (
        <LearningLayout>
            <div>
                <Spinner />
            </div>
        </LearningLayout>
    )

    return (
        <LearningLayout>
            <Modal
                title={description}
                description=""
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                children={(
                    <Card
                        className={cn("bg-no-repeat bg-center bg-cover md:flex-grow", image && "h-60")}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                )}
            />
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <ConceptTitle>{evalFormQuery.data.evaluationForm?.materialItem?.title} {type === "assignment" ? " Assignment" : " Quiz"}</ConceptTitle>
                        {
                            submission
                                ? (
                                    <SeverityPill color="info">
                                        {
                                            getEvalutaionStatus(
                                                evalFormQuery.data.evaluationForm.materialItem?.zoomSessions.find(session => session.materialItemId === evalFormQuery.data.evaluationForm?.materialItemId)?.sessionDate || new Date(),
                                                !!submission
                                            )
                                        }
                                    </SeverityPill>
                                )
                                : (
                                    <>
                                        <SeverityPill color="info">
                                            {
                                                getEvalutaionStatus(
                                                    evalFormQuery.data.evaluationForm.materialItem?.zoomSessions.find(session => session.materialItemId === evalFormQuery.data.evaluationForm?.materialItemId)?.sessionDate || new Date(),
                                                    !!submission
                                                )
                                            }
                                        </SeverityPill>
                                        <Typography>Total Points: {totalPoints}</Typography>

                                    </>
                                )
                        }
                    </div>
                    {isSubmitted && (
                        <div className="flex items-center gap-2 flex-nowrap">
                            <Typography>Your score is</Typography>
                            <Button className="pointer-events-none" variant={"icon"} customeColor={score > totalPoints / 2 ? "success" : "destructive"}>
                                {score}
                            </Button>
                            <Typography> of </Typography>
                            <Button className="pointer-events-none" variant={"icon"} customeColor={"success"}>
                                {totalPoints}
                            </Button>
                        </div>
                    )}
                </div>
                {!userQuery.data?.user?.zoomGroups.some(group => group.zoomSessions.some(session => session.materialItemId === evalFormQuery.data?.evaluationForm?.materialItemId))
                    ? (
                        <div className="w-full text-center p-8">
                            <Typography variant={"secondary"}>
                                Form is not due yet! please check again later.
                            </Typography>
                        </div>
                    )
                    : (
                        <div className="p-4 space-y-4">
                            {evalFormQuery.data.evaluationForm.questions.map((question, index) => (
                                <EvaluationFormQuestionCard
                                    key={`${question.questionText}questionCard${index}`}
                                    question={question}
                                    index={index}
                                    setAnswers={setAnswers}
                                    setDescription={setDescription}
                                    setImage={setImage}
                                    setIsImageModalOpen={setIsImageModalOpen}
                                    isSubmitted={isSubmitted}
                                    submission={submission}
                                    score={score}
                                    totalPoints={totalPoints}
                                    evaluationForm={evalFormQuery.data.evaluationForm!}
                                />
                            ))}
                            {evalFormQuery.data.evaluationForm.googleForm?.formRespondUrl ? (
                                <Link href={evalFormQuery.data.evaluationForm.googleForm?.formRespondUrl} target="_blank" >
                                    <Button>Open Google Forms</Button>
                                </Link>
                            ) : !isSubmitted && (
                                <Button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </Button>
                            )}
                        </div>
                    )}
            </div>
        </LearningLayout>
    )
}

export default AssignmentPage