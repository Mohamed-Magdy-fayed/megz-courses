"use client"

import { useMemo } from "react"
import { useRouter } from "next/router"
import { BookIcon, BookMarkedIcon, DownloadIcon, FileBadgeIcon, FileKey2Icon, FileTextIcon, TrophyIcon, VoteIcon } from "lucide-react"
import { format } from "date-fns"

import { api } from "@/lib/api"
import { NavMain } from "@/components/pages/LearningLayout/nav-main"
import { Typography } from "@/components/ui/Typoghraphy"
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge"
import { DisplayCertificateBadge } from "@/components/student/myCoursesComponents/general/display-certificate-badge"
import GoBackButton from "@/components/ui/go-back"
import LearningLayout from "@/components/pages/LearningLayout/LearningLayout"
import LevelsClient from "@/components/student/myCoursesComponents/course-components/levels-client"

const CoursePage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string;

    const { data, isLoading, isError, error } = api.courses.getLearningMenu.useQuery({ courseSlug }, { enabled: !!courseSlug })
    const course = useMemo(() => data?.courseStatues[0]?.course, [data])

    if (isLoading && !error) {
        return <LearningLayout isLoading={isLoading} children={null} />
    }

    if (isError && error) {
        return <LearningLayout children={null} error={error.message} />
    }

    if (!course) {
        return <LearningLayout children={null} error="Seems you're not in a group for this level yet, please try again later!" />
    }

    return (
        <LearningLayout
            sidebarContent={
                <NavMain
                    sidebarLabel={course.name}
                    items={[...data.courseStatues.map(courseStatus => {
                        return ({
                            icon: BookIcon,
                            title: courseStatus.level?.name || "Level Name",
                            items: [...(courseStatus.level?.materialItems.map(item => {
                                const zoomSession = item.zoomSessions[0];

                                // Drip logic: Only allow access if session is available/unlocked
                                const canAccessQuiz = zoomSession && !["Cancelled", "Scheduled"].includes(zoomSession.sessionStatus);
                                const canAccessSession = zoomSession && ["Ongoing", "Completed"].includes(zoomSession.sessionStatus);
                                const canAccessAssignment = zoomSession && zoomSession.sessionStatus === "Completed";

                                return ({
                                    title: item.title,
                                    icon: FileTextIcon,
                                    items: [
                                        { icon: VoteIcon, action: zoomSession?.id ? <DisplaySubmissionBadge className="ml-auto" id={zoomSession.id} type={"Quiz"} /> : undefined, isActive: !!canAccessQuiz, title: "Quiz", url: `/student/my_courses/${courseSlug}/${courseStatus.level?.slug}/quiz/${zoomSession?.id}` },
                                        { icon: DownloadIcon, isActive: !!canAccessSession, title: "Session", url: `/student/my_courses/${courseSlug}/${courseStatus.level?.slug}/session/${zoomSession?.id}` },
                                        { icon: BookMarkedIcon, action: zoomSession?.id ? <DisplaySubmissionBadge className="ml-auto" id={zoomSession.id} type={"Assignment"} /> : undefined, isActive: !!canAccessAssignment, title: "Assignment", url: `/student/my_courses/${courseSlug}/${courseStatus.level?.slug}/assignment/${zoomSession?.id}` },
                                    ],
                                })
                            }) || []), {
                                icon: TrophyIcon,
                                title: "Level Completion",
                                items: [
                                    { icon: FileKey2Icon, action: courseStatus.level?.systemForms[0]?.id ? <DisplaySubmissionBadge className="ml-auto" id={courseStatus.level?.systemForms[0]?.id} type={"FinalTest"} /> : undefined, isActive: !courseStatus.course.certificates[0] && courseStatus.level?.materialItems.every(i => i.zoomSessions[0]?.sessionStatus === "Completed"), title: "Final Test", url: `/student/my_courses/${courseSlug}/${data.courseStatues[0]?.level?.slug}/final_test` },
                                    { icon: FileBadgeIcon, action: courseStatus.level?.id ? <DisplayCertificateBadge className="ml-auto" id={courseStatus.level.id} /> : undefined, isActive: courseStatus.level?.materialItems.every(i => i.zoomSessions[0]?.sessionStatus === "Completed"), title: "Certificate", url: `/student/my_courses/${courseSlug}/${data.courseStatues[0]?.level?.slug}/certificate` },
                                ]
                            }]
                        })
                    })]}
                />
            }
        >
            <div className="flex flex-col items-start md:p-4">
                <div className="p-4 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GoBackButton />
                        <Typography variant={"primary"}>{course.name} Course</Typography>
                    </div>
                    <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                </div>
                <div className="p-4 w-full space-y-4">
                    <LevelsClient courseSlug={courseSlug} />
                </div>
            </div>
        </LearningLayout>
    )
}

export default CoursePage