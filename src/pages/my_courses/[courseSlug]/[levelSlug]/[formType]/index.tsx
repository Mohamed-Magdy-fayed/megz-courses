import { EvaluationFormQuestionCard } from "@/components/FormsComponents/EvaluationForm/EvaluationFormQuestionCard";
import Spinner from "@/components/Spinner";
import LearningLayout from "@/components/LearningLayout/LearningLayout";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";
import { cn, formatPercentage, getEvalutaionFormFullMark, getEvalutaionStatus } from "@/lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { useEvalformSubmission } from "@/hooks/useEvalFormSubmission";
import { useSession } from "next-auth/react";

const AssignmentPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string
    const type = router.query.formType as string

    const { toastError, toastSuccess, toast } = useToast()

    const trpcUtils = api.useContext()
    const courseQuery = api.courses.getBySlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug })
    const evalFormQuery = api.evaluationForm.getFinalTest.useQuery({ courseSlug }, { enabled: !!type })
    const userQuery = api.users.getCurrentUser.useQuery()

    const submitMutation = api.evaluationFormSubmissions.createEvalFormSubmission.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ evaluationFormSubmission }) => evaluationFormSubmission.rating > getEvalutaionFormFullMark(evalFormQuery.data?.finalTest?.questions!) / 2
            ? toastSuccess(`Thank you, your score is ${evaluationFormSubmission.rating}`)
            : toastError(`Thank you, your score is ${evaluationFormSubmission.rating}`),
        onError: ({ message }) => toastError(message),
        onSettled: () => {
            trpcUtils.invalidate()
                .then(() => setLoading(false))
        },
    })

    const session = useSession()

    const {
        googleSubmission,
        systemSubmission,
        submittedAlready,
        systemAnswers,
        totalPoints,
        isLoading,
        setSystemAnswers,
    } = useEvalformSubmission({ courseSlug, levelSlug, enabled: (!!courseSlug && !!levelSlug), isAssignment: type === "assignment" ? true : type === "quiz" ? false : undefined }, [type])

    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [loading, setLoading] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [createSubmissionToast, setCreateSubmissionToast] = useState<toastType>()

    const handleSubmit = () => {
        if (!systemAnswers) return toastError("no answers!")
        if (!evalFormQuery.data?.finalTest?.type) return toastError("no form type!")
        if (!courseQuery?.data?.course?.id) return toastError("no course!")

        submitMutation.mutate({
            answers: systemAnswers,
            evaluationFormId: evalFormQuery.data.finalTest.id,
            type: evalFormQuery.data.finalTest.type,
            courseId: courseQuery.data.course.id,
        })
    }

    const generateCertificateMutation = api.certificates.createCertificate.useMutation()
    const checkSubmissionMutation = api.googleAccounts.getGoogleFormResponses.useMutation({
        onMutate: () => {
            setCreateSubmissionToast(
                toast({
                    title: "Checking...",
                    description: <Spinner className="w-4 h-4" />,
                    duration: 100000,
                    variant: "info",
                })
            )
        },
        onSuccess: ({ userResponse, updatedForm }) => {
            createSubmissionToast?.update({
                id: createSubmissionToast.id,
                title: "Success",
                description: <Typography>
                    Thank you, You scored {userResponse.totalScore} of {evalFormQuery.data?.finalTest?.totalPoints} points With a percentage of {formatPercentage(userResponse.totalScore! / (evalFormQuery.data?.finalTest?.totalPoints || 0) * 100)}
                </Typography>,
                duration: 3000,
                variant: "success",
            })
            if (!evalFormQuery.data?.finalTest) return toastError("evaluation form not present")
            generateCertificateMutation.mutate({
                courseSlug,
                levelSlug,
                score: formatPercentage(userResponse.totalScore! / (evalFormQuery.data?.finalTest?.totalPoints || 0) * 100),
            })
        },
        onError: ({ message }) => createSubmissionToast?.update({
            id: createSubmissionToast.id,
            title: "Ops!",
            description: message,
            duration: 3000,
            variant: "destructive",
        }),
        onSettled: () => {
            trpcUtils.invalidate().then(() => {
                createSubmissionToast?.dismissAfter()
                setCreateSubmissionToast(undefined)
            })
        },
    })

    const handleCheckSubmission = () => {
        if (!evalFormQuery.data?.finalTest?.googleFormUrl || !evalFormQuery.data?.finalTest?.googleForm?.googleClientId) return toastError("Not a google form!")
        checkSubmissionMutation.mutate({
            url: evalFormQuery.data.finalTest.googleFormUrl,
            clientId: evalFormQuery.data.finalTest.googleForm.googleClientId,
        })
    }

    if (evalFormQuery.isLoading || !evalFormQuery.data?.finalTest || isLoading) return (
        <LearningLayout>
            <div>
                <Spinner className="mx-auto" />
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
                        <ConceptTitle>{evalFormQuery.data.finalTest?.materialItem?.title} {type === "assignment" ? " Assignment" : type === "quiz" ? "Quiz" : "Final Test"}</ConceptTitle>
                        {
                            systemSubmission || submittedAlready
                                ? (
                                    <SeverityPill color="info">
                                        {
                                            getEvalutaionStatus(
                                                evalFormQuery.data.finalTest.materialItem?.zoomSessions.find(session => session.materialItemId === evalFormQuery.data.finalTest?.materialItemId)?.sessionDate || new Date(),
                                                (!!systemSubmission || submittedAlready)
                                            )
                                        }
                                    </SeverityPill>
                                )
                                : (
                                    <>
                                        <SeverityPill color="info">
                                            {
                                                getEvalutaionStatus(
                                                    evalFormQuery.data.finalTest.materialItem?.zoomSessions.find(session => session.materialItemId === evalFormQuery.data.finalTest?.materialItemId)?.sessionDate || new Date(),
                                                    !!systemSubmission
                                                )
                                            }
                                        </SeverityPill>
                                        <Typography>Total Points: {totalPoints}</Typography>
                                    </>
                                )
                        }
                    </div>
                    {submittedAlready && (
                        <div className="flex items-center gap-2 flex-nowrap">
                            <Typography>Your score is</Typography>
                            <Button className="pointer-events-none" variant={"icon"} customeColor={(systemSubmission?.rating || googleSubmission?.score || 0) > totalPoints / 2 ? "success" : "destructive"}>
                                {systemSubmission?.rating || googleSubmission?.score}
                            </Button>
                            <Typography> of </Typography>
                            <Button className="pointer-events-none" variant={"icon"} customeColor={"success"}>
                                {evalFormQuery.data.finalTest.totalPoints}
                            </Button>
                        </div>
                    )}
                </div>
                {!userQuery.data?.user?.zoomGroups.some(g => g.course?.slug === courseSlug && g.zoomSessions.every(s => s.sessionStatus === "completed"))
                    ? (
                        <div className="w-full text-center p-8">
                            <Typography variant={"secondary"}>
                                Final Test is not available now.
                            </Typography>
                        </div>
                    )
                    : (
                        <div className="p-4 space-y-4">
                            {evalFormQuery.data.finalTest.questions.map((question, index) => (
                                <EvaluationFormQuestionCard
                                    key={`${question.questionText}questionCard${index}`}
                                    question={question}
                                    index={index}
                                    setAnswers={setSystemAnswers}
                                    setDescription={setDescription}
                                    setImage={setImage}
                                    setIsImageModalOpen={setIsImageModalOpen}
                                    isSubmitted={submittedAlready}
                                    submission={systemSubmission}
                                    score={systemSubmission?.rating || 0}
                                    totalPoints={totalPoints}
                                    evaluationForm={evalFormQuery.data.finalTest!}
                                />
                            ))}
                            {evalFormQuery.data.finalTest.googleForm?.formRespondUrl ? (
                                <div className="flex flex-col items-start gap-4">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="button"
                                            className="relative"
                                            disabled={!!createSubmissionToast || submittedAlready}
                                            onClick={() => window.open(evalFormQuery.data.finalTest?.googleForm?.formRespondUrl!, "_blank")}
                                            customeColor={"info"}
                                        >
                                            {!!createSubmissionToast && <Spinner className="w-4 h-4 mr-2" />}
                                            <Typography>
                                                {!!createSubmissionToast ? "Loading..." : "Go to form"}
                                            </Typography>
                                        </Button>
                                        <Button
                                            type="button"
                                            className="relative"
                                            disabled={!!createSubmissionToast || submittedAlready}
                                            onClick={handleCheckSubmission}
                                            customeColor={"success"}
                                        >
                                            {!!createSubmissionToast && <Spinner className="w-4 h-4 mr-2" />}
                                            <Typography>
                                                {!!createSubmissionToast ? "Loading..." : "Check my result"}
                                            </Typography>
                                        </Button>
                                    </div>
                                    {googleSubmission?.isSubmitted && (
                                        <Typography
                                            variant={"secondary"}
                                            className={cn(
                                                googleSubmission.score / evalFormQuery.data.finalTest.totalPoints * 100 > 50
                                                    ? "text-success"
                                                    : "text-destructive"
                                            )}
                                        >
                                            Score: {formatPercentage(googleSubmission.score / evalFormQuery.data.finalTest.totalPoints * 100)}
                                        </Typography>
                                    )}
                                </div>
                            ) : !submittedAlready && (
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