"use client"

import type { NextPage } from "next";
import { useRouter } from "next/router";
import { VoteIcon, DownloadIcon, BookMarkedIcon, AlertCircleIcon } from "lucide-react";

import { api } from "@/lib/api";
import { NavMain } from "@/components/pages/LearningLayout/nav-main";
import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import MaterialShowcase from "@/components/admin/systemManagement/contentComponents/materials/MaterialShowcase";
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const SessionPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string
    const sessionId = router.query.sessionId as string

    const { data: session, isLoading, isError, error } = api.zoomSessions.getById.useQuery({ id: sessionId }, { enabled: !!sessionId })

    // Drip logic: Only allow access if session is available/unlocked
    const canAccessQuiz = session && !["Cancelled", "Scheduled"].includes(session.sessionStatus);
    const canAccessSession = session && ["Ongoing", "Completed"].includes(session.sessionStatus);
    const canAccessAssignment = session && session.sessionStatus === "Completed";

    const sidebarContent = (
        <NavMain
            sidebarLabel={session?.materialItem?.title}
            items={[
                { icon: VoteIcon, action: session?.id ? <DisplaySubmissionBadge className="ml-auto" id={session.id} type={"Quiz"} /> : undefined, isActive: !!canAccessQuiz, title: "Quiz", url: canAccessQuiz ? `/student/my_courses/${courseSlug}/${levelSlug}/quiz/${session.id}` : undefined },
                { icon: DownloadIcon, isActive: !!canAccessSession, title: "Session", url: canAccessSession ? `/student/my_courses/${courseSlug}/${levelSlug}/session/${session.id}` : undefined },
                { icon: BookMarkedIcon, action: session?.id ? <DisplaySubmissionBadge className="ml-auto" id={session.id} type={"Assignment"} /> : undefined, isActive: !!canAccessAssignment, title: "Assignment", url: canAccessAssignment ? `/student/my_courses/${courseSlug}/${levelSlug}/assignment/${session.id}` : undefined },
            ]}
        />
    )

    if (isLoading && !error) {
        return <LearningLayout isLoading={isLoading} children={null} />
    }

    if (isError && error) {
        return <LearningLayout children={null} error={error.message} />
    }

    if (!session?.materialItem) {
        return <LearningLayout children={null} error="Seems you're not in a group for this level yet, please try again later!" />
    }

    return (
        <LearningLayout sidebarContent={sidebarContent}>
            {!canAccessSession
                ? <Alert className="w-fit mx-auto">
                    <AlertCircleIcon />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        Session Content will be available soon!
                    </AlertDescription>
                </Alert>
                : <MaterialShowcase
                    courseSlug={courseSlug}
                    levelSlug={levelSlug}
                    materialItem={session.materialItem}
                />}
        </LearningLayout>
    )
}

export default SessionPage