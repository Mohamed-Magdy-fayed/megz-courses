"use client"

import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { useRouter } from "next/router";
import SystemFormCard from "@/components/admin/systemManagement/systemForms/SystemFormCard";
import { api } from "@/lib/api";
import { useMemo, useRef } from "react";
import { NavMain } from "@/components/pages/LearningLayout/nav-main";
import { DisplayCertificateBadge } from "@/components/student/myCoursesComponents/general/display-certificate-badge";
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge";
import { BookIcon, VoteIcon, DownloadIcon, BookMarkedIcon, TrophyIcon, FileKey2Icon, FileBadgeIcon } from "lucide-react";

const FinalTestPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ formType }) => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string
    const levelSlug = router.query.levelSlug as string

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
            <SystemFormCard
                courseSlug={courseSlug}
                levelSlug={levelSlug}
                formType={"FinalTest"}
                enabled={!!courseSlug && !!levelSlug}
            />
        </LearningLayout>
    )
}

export const getServerSideProps: GetServerSideProps<{ formType: string }> = async (context) => {
    const { query } = context;

    if (query.formType !== "final_test") {
        const { courseSlug, levelSlug } = query as { courseSlug: string; levelSlug: string };
        return {
            redirect: {
                destination: `/student/my_courses/${courseSlug}/${levelSlug}`,
                permanent: false,
            },
        };
    }

    return {
        props: {
            formType: query.formType,
        },
    };
};

export default FinalTestPage