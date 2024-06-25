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
import { useSession } from "next-auth/react";
import { EvaluationFormSubmission, SubmissionAnswer } from "@prisma/client";
import { SeverityPill } from "@/components/overview/SeverityPill";

const AssignmentPage: NextPage = () => {
    const router = useRouter()
    const courseId = router.query.courseId as string
    const id = router.query.assignmentId as string
    const { toastError, toastSuccess } = useToast()
    const { data } = useSession()
    const trpcUtils = api.useContext()
    const assignmentQuery = api.evaluationForm.getEvalFormById.useQuery({ id })
    const userQuery = api.users.getUserById.useQuery({ id: data?.user.id! }, { enabled: !!data?.user.id })
    const submitMutation = api.evaluationFormSubmissions.createEvalFormSubmission.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ evaluationFormSubmission }) => evaluationFormSubmission.rating > getEvalutaionFormFullMark(assignmentQuery.data?.evaluationForm?.questions!) / 2
            ? toastSuccess(`Thank you, your score is ${evaluationFormSubmission.rating}`)
            : toastError(`Thank you, your score is ${evaluationFormSubmission.rating}`),
        onError: ({ message }) => toastError(message),
        onSettled: () => {
            trpcUtils.evaluationForm.invalidate()
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
        if (!data?.user) return toastError("not logged in!")
        if (!answers) return toastError("no answers!")
        if (!assignmentQuery.data?.evaluationForm?.type) return toastError("no form type!")

        submitMutation.mutate({
            answers,
            evaluationFormlId: id,
            userId: data.user.id,
            type: assignmentQuery.data.evaluationForm.type,
            courseId,
        })
    }

    useEffect(() => {
        if (!assignmentQuery.data?.evaluationForm?.questions) return
        setAnswers(assignmentQuery.data.evaluationForm.questions.map(({ id }) => ({ questionId: id, isTrue: null, text: null })))
        setTotalPoints(assignmentQuery.data.evaluationForm.questions.map(q => q.points).reduce((a, b) => a + b, 0))
    }, [assignmentQuery.data?.evaluationForm])

    useEffect(() => {
        if (!userQuery.data?.user) return
        setIsSubmitted(userQuery.data.user.evaluationFormSubmissions.some(submission => submission.evaluationFormId === id))
        setScore(userQuery.data.user.evaluationFormSubmissions.find(submission => submission.evaluationFormId === id)?.rating || 0)
        setSubmission(userQuery.data.user.evaluationFormSubmissions.find(submission => submission.evaluationFormId === id))
    }, [userQuery.data?.user])

    if (assignmentQuery.isLoading || !assignmentQuery.data?.evaluationForm) return (
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
                        <ConceptTitle>{assignmentQuery.data.evaluationForm?.materialItem?.title} Assignment</ConceptTitle>
                        {
                            submission
                                ? (
                                    <SeverityPill color="info">
                                        {
                                            getEvalutaionStatus(
                                                assignmentQuery.data.evaluationForm.materialItem?.zoomSessions.find(session => session.materialItemId === assignmentQuery.data.evaluationForm?.materialItemId)?.sessionDate || new Date(),
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
                                                    assignmentQuery.data.evaluationForm.materialItem?.zoomSessions.find(session => session.materialItemId === assignmentQuery.data.evaluationForm?.materialItemId)?.sessionDate || new Date(),
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
                {!userQuery.data?.user.zoomGroups.some(group => group.zoomSessions.some(session => session.materialItemId === assignmentQuery.data?.evaluationForm?.materialItemId))
                    ? (
                        <div className="w-full text-center p-8">
                            <Typography variant={"secondary"}>
                                Form is not due yet! please check again later.
                            </Typography>
                        </div>
                    )
                    : (
                        <>
                            {assignmentQuery.data.evaluationForm.questions.map((question, index) => (
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
                                    evaluationForm={assignmentQuery.data.evaluationForm!}
                                />
                            ))}
                            {!isSubmitted && <Button
                                type="button"
                                disabled={loading}
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>}
                        </>
                    )}
            </div>
        </LearningLayout>
    )
}

export default AssignmentPage