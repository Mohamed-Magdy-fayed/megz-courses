"use client"

import type { NextPage } from "next";
import { SystemFormTypes } from "@prisma/client";

import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { NavMain } from "@/components/pages/LearningLayout/nav-main";
import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import SystemFormCard from "@/components/admin/systemManagement/systemForms/SystemFormCard";
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge";
import { VoteIcon, DownloadIcon, BookMarkedIcon } from "lucide-react";
import level from "pusher-js/types/src/core/timeline/level";

const AssignmentPage: NextPage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string
    const sessionId = router.query.sessionId as string
    const type: SystemFormTypes | undefined = router.query.formType === "assignment" ? "Assignment" : router.query.formType === "quiz" ? "Quiz" : undefined

    const { data: session, isLoading, isError, error } = api.materials.getBySessionId.useQuery({ sessionId }, { enabled: !!sessionId })

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

    if (!session || !type) {
        return <LearningLayout children={null} error="Seems you're not in a group for this level yet, please try again later!" />
    }

    return (
        <LearningLayout sidebarContent={sidebarContent}>
            <SystemFormCard
                courseSlug={courseSlug}
                formType={type}
                levelSlug={levelSlug}
                sessionId={sessionId}
                enabled={!!courseSlug && !!sessionId && !!type}
            />
        </LearningLayout>
    )
}

export default AssignmentPage