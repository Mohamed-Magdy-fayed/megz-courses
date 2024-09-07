import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoginModal from "@/components/modals/LoginModal";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { cn, formatPercentage } from "@/lib/utils";
import GenericClient from "@/components/GenericClient";
import { columns } from "@/components/courses/CourseColumn";
import GoBackButton from "@/components/ui/go-back";

const CoursesPage: NextPage = () => {
    const session = useSession()

    const [loginModalOpen, setLoginModalOpen] = useState(false)

    const { data, isLoading } = api.courses.getStudentCourses.useQuery(undefined, { enabled: session.data?.user.isVerified })

    useEffect(() => {
        if (session.status === "loading") return
        if (session.data?.user) setLoginModalOpen(false)
        if (!session.data?.user) setLoginModalOpen(true)
    }, [session.data?.user])

    return (
        <LandingLayout>
            <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                            <GoBackButton />
                            <ConceptTitle>Courses</ConceptTitle>
                        </div>
                    </div>
                    {
                        !session.data?.user
                            ? (<Typography>Please login to continue!</Typography>)
                            : !session.data?.user.isVerified ?
                                (<Typography>Please verify your email!</Typography>)
                                : isLoading ? (
                                    <PaperContainer className={cn(isLoading && "animate-pulse bg-muted/10")}>
                                        <GenericClient columns={columns} />
                                    </PaperContainer>
                                ) : (
                                    <PaperContainer className={cn(isLoading && "animate-pulse bg-muted/10")}>
                                        <GenericClient
                                            columns={columns}
                                            formattedData={data?.courses ? data?.courses.map(({
                                                id,
                                                slug,
                                                name,
                                            }) => {
                                                const filteredTest = data?.user.placementTests.find((test) => test.courseId === id);
                                                const isSubmitted = data?.user.evaluationFormSubmissions.some(sub => sub.evaluationFormId === filteredTest?.evaluationFormId)
                                                const studentPoints = data?.user.evaluationFormSubmissions.find(sub => sub.evaluationFormId === filteredTest?.evaluationFormId)?.rating
                                                const totalPoints = filteredTest?.writtenTest.totalPoints
                                                const oralTestSubmission = data.user.courseStatus.find(status => status.courseId === id)
                                                const isOralTestScheduled = data?.user.placementTests.length !== 0
                                                const oralTestTime = filteredTest?.oralTestTime || new Date()
                                                const status = !filteredTest ? "Waiting Placement Test"
                                                    : !isSubmitted ? "Need Submission"
                                                        : !isOralTestScheduled ? "Oral Test Not Scheduled"
                                                            : !oralTestSubmission ? "Awaiting oral test result"
                                                                : oralTestSubmission.level?.name || ""

                                                const user = data.user
                                                return {
                                                    id,
                                                    slug,
                                                    name,
                                                    placementTestLink: `/placement_test/${id}`,
                                                    isSubmitted,
                                                    score: isSubmitted ? `Score: ${formatPercentage((studentPoints || 0) / (totalPoints || 0) * 100)}` : "Not Submitted",
                                                    isOralTestScheduled,
                                                    oralTestTime: format(oralTestTime, "PPPp"),
                                                    status,
                                                    group: user.zoomGroups.filter(group => group.courseId === id).map(group => ({
                                                        userName: user.name,
                                                        userEmail: user.email,
                                                        groupNumber: group.groupNumber,
                                                        meetingNumber: group.meetingNumber,
                                                        meetingPassword: group.meetingPassword,
                                                        isSessionOngoing: group.zoomSessions.some(session => session.sessionStatus === "ongoing"),
                                                        ongoingSession: {
                                                            materialItemTitle: group.zoomSessions.find(session => session.sessionStatus === "ongoing")?.materialItem?.title || "",
                                                            id: group.zoomSessions.find(session => session.sessionStatus === "ongoing")?.id || ""
                                                        },
                                                    }))[0]
                                                }
                                            }) : []}
                                        />
                                    </PaperContainer>
                                )
                    }
                </div>
            </main>
        </LandingLayout>
    );
}

export default CoursesPage