"use client"

import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import { Button } from "@/components/ui/button";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { downloadCertificatePdf, downloadCertificatePng } from "@/lib/certificateExport";
import { format } from "date-fns";
import { AlertCircleIcon, BookIcon, BookMarkedIcon, DownloadIcon, FileBadgeIcon, FileKey2Icon, FileTextIcon, TrophyIcon, VoteIcon } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { NavMain } from "@/components/pages/LearningLayout/nav-main";
import { DisplayCertificateBadge } from "@/components/student/myCoursesComponents/general/display-certificate-badge";
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import CertificateCanvas from "@/components/general/certificates/CertificateCanvas";

const CertificatePage: NextPage = () => {
    const router = useRouter();
    const courseSlug = router.query.courseSlug as string;
    const levelSlug = router.query.levelSlug as string;
    const { data: certData } = api.certificates.getCertificate.useQuery(
        { courseSlug, levelSlug },
        { enabled: !!courseSlug && !!levelSlug }
    );
    const { data, isLoading, isError, error } = api.zoomGroups.getZoomGroupByLevel.useQuery({ courseSlug, levelSlug }, { enabled: !!courseSlug && !!levelSlug })

    const { group, course, level, materials, sessions, certificate } = useMemo(() => ({
        group: data?.zoomGroup,
        course: data?.zoomGroup?.course,
        level: data?.zoomGroup?.courseLevel,
        sessions: data?.zoomGroup?.zoomSessions,
        materials: data?.zoomGroup?.courseLevel?.materialItems,
        certificate: data?.zoomGroup?.courseLevel?.certificates[0],
    }), [data?.zoomGroup])

    const printRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!printRef.current || !certData?.certificate?.certificateId) return;
        await downloadCertificatePng(printRef.current, certData.certificate.certificateId);
    };

    const handleDownloadPdf = async () => {
        if (!printRef.current || !certData?.certificate?.certificateId) return;
        await downloadCertificatePdf(printRef.current, certData.certificate.certificateId);
    };

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
            <Head>
                <title>{certData?.certificate?.user?.name} Certificate</title>
                <meta
                    name="description"
                    content={`Certificate ID: ${certData?.certificate?.certificateId}`}
                />
            </Head>
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <ConceptTitle>
                            {certData?.certificate?.course?.name} Certificate
                        </ConceptTitle>
                    </div>
                    {certData?.certificate && (
                        <div className="flex items-center gap-2">
                            <WrapWithTooltip text="Download PNG">
                                <Button
                                    variant={"icon"}
                                    customeColor={"infoIcon"}
                                    onClick={handleDownload}
                                >
                                    <DownloadIcon />
                                </Button>
                            </WrapWithTooltip>
                            <WrapWithTooltip text="Download PDF">
                                <Button
                                    variant={"icon"}
                                    customeColor={"infoIcon"}
                                    onClick={handleDownloadPdf}
                                >
                                    <FileTextIcon />
                                </Button>
                            </WrapWithTooltip>
                        </div>
                    )}
                </div>
                {certData?.certificate ? (
                    <div ref={printRef}>
                        <CertificateCanvas
                            certificateId={certData.certificate.certificateId || ""}
                            completionDate={format(
                                certData.certificate.completionDate || new Date(),
                                "PP"
                            )}
                            courseName={certData.certificate.course?.name || ""}
                            levelName={certData.certificate.courseLevel?.name || ""}
                            studentName={certData.certificate.user?.name || ""}
                            trainerName={
                                certData.certificate.user.zoomGroups.find(
                                    (g) =>
                                        g.courseId === certData.certificate?.course?.id &&
                                        g.courseLevelId === certData.certificate?.courseLevelId
                                )?.teacher?.user.name || ""
                            }
                        />
                    </div>
                ) : (
                    <Alert className="w-fit mx-auto">
                        <AlertCircleIcon />
                        <AlertTitle>Heads up!</AlertTitle>
                        <AlertDescription>
                            Your certificate will be ready after you submit your final test!
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </LearningLayout>
    );
};

export default CertificatePage;