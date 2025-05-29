"use client"

import { useMemo } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { BookIcon, MessagesSquareIcon, BookMarkedIcon, DownloadIcon, VoteIcon } from "lucide-react"

import { api } from "@/lib/api"
import LearningLayout from "@/components/pages/LearningLayout/LearningLayout"
import { NavMain } from "@/components/pages/LearningLayout/nav-main"
import MaterialsClient from "@/components/student/myCoursesComponents/level-components/materials-client"
import { Typography } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import GoBackButton from "@/components/ui/go-back"
import { TrophyIcon } from "lucide-react"
import { FileKey2Icon } from "lucide-react"
import { FileBadgeIcon } from "lucide-react"
import { DisplayCertificateBadge } from "@/components/student/myCoursesComponents/general/display-certificate-badge"
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge"

const LevelPage = () => {
    const router = useRouter()
    const { courseSlug, levelSlug } = router.query as { courseSlug: string, levelSlug: string }

    const { data, isLoading, isError, error } = api.zoomGroups.getZoomGroupByLevel.useQuery({ courseSlug, levelSlug }, { enabled: !!courseSlug && !!levelSlug })

    const { group, course, level, materials, sessions, certificate } = useMemo(() => ({
        group: data?.zoomGroup,
        course: data?.zoomGroup?.course,
        level: data?.zoomGroup?.courseLevel,
        sessions: data?.zoomGroup?.zoomSessions,
        materials: data?.zoomGroup?.courseLevel?.materialItems,
        certificate: data?.zoomGroup?.courseLevel?.certificates[0],
    }), [data?.zoomGroup])

    if (isLoading && !error) {
        return <LearningLayout isLoading={isLoading} children={null} />
    }

    if (isError && error) {
        return <LearningLayout children={null} error={error.message} />
    }

    if (!group || !course || !level || !materials || !sessions) {
        return <LearningLayout children={null} error="Seems you're not in a group for this level yet, please try again later!" />
    }

    return (
        <LearningLayout
            sidebarContent={
                <NavMain
                    sidebarLabel={level.name}
                    items={[...materials.map(material => {
                        const zoomSession = sessions.find(session => session.materialItemId === material.id);

                        // Drip logic: Only allow access if session is available/unlocked
                        const canAccessQuiz = zoomSession && !["Cancelled", "Scheduled"].includes(zoomSession.sessionStatus);
                        const canAccessSession = zoomSession && ["Ongoing", "Completed"].includes(zoomSession.sessionStatus);
                        const canAccessAssignment = zoomSession && zoomSession.sessionStatus === "Completed";

                        return {
                            icon: BookIcon,
                            title: material.title || "Material Name",
                            items: [
                                { icon: VoteIcon, action: zoomSession?.id ? <DisplaySubmissionBadge className="ml-auto" id={zoomSession.id} type={"Quiz"} /> : undefined, isActive: !!canAccessQuiz, title: "Quiz", url: canAccessQuiz ? `/student/my_courses/${courseSlug}/${level?.slug}/quiz/${zoomSession.id}` : undefined },
                                { icon: DownloadIcon, isActive: !!canAccessSession, title: "Session", url: canAccessSession ? `/student/my_courses/${courseSlug}/${level?.slug}/session/${zoomSession.id}` : undefined },
                                { icon: BookMarkedIcon, action: zoomSession?.id ? <DisplaySubmissionBadge className="ml-auto" id={zoomSession.id} type={"Assignment"} /> : undefined, isActive: !!canAccessAssignment, title: "Assignment", url: canAccessAssignment ? `/student/my_courses/${courseSlug}/${level?.slug}/assignment/${zoomSession.id}` : undefined },
                            ],
                        };
                    }), {
                        icon: TrophyIcon,
                        title: "Level Completion",
                        items: [
                            { icon: FileKey2Icon, isActive: !certificate && sessions.every(s => s.sessionStatus === "Completed"), action: level?.systemForms[0]?.id ? <DisplaySubmissionBadge className="ml-auto" id={level?.systemForms[0]?.id} type={"FinalTest"} /> : undefined, title: "Final Test", url: `/student/my_courses/${courseSlug}/${levelSlug}/final_test` },
                            { icon: FileBadgeIcon, action: level?.id ? <DisplayCertificateBadge className="ml-auto" id={level.id} /> : undefined, isActive: sessions.every(s => s.sessionStatus === "Completed"), title: "Certificate", url: `/student/my_courses/${courseSlug}/${levelSlug}/certificate` },
                        ]
                    }]}
                />
            }
        >
            <div className="flex flex-col items-start md:p-4">
                <div className="p-4 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GoBackButton />
                        <Typography variant={"primary"}>{course.name} Course</Typography>
                    </div>
                    <Link href={`/student/discussions/${group.id}`}>
                        <Button>Group Discussion<MessagesSquareIcon size={20} className="ml-2" /></Button>
                    </Link>
                </div>
                <div className="w-full">
                    <MaterialsClient courseSlug={courseSlug} levelSlug={levelSlug} />
                </div>
            </div>
        </LearningLayout >
    )
}

export default LevelPage