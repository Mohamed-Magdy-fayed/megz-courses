"use client"

import LearningLayout from "@/components/pages/LearningLayout/LearningLayout";
import Spinner from "@/components/ui/Spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { BookIcon, BookMarkedIcon, DownloadIcon, FileBadgeIcon, FileKey2Icon, Printer, TrophyIcon, VoteIcon } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { NavMain } from "@/components/pages/LearningLayout/nav-main";
import { DisplayCertificateBadge } from "@/components/student/myCoursesComponents/general/display-certificate-badge";
import { DisplaySubmissionBadge } from "@/components/student/myCoursesComponents/general/display-submission-badge";

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

    const handlePrint = () => {
        if (printRef.current) {
            window.print();
        }
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
                    <WrapWithTooltip text="Print">
                        <Button
                            variant={"icon"}
                            customeColor={"infoIcon"}
                            onClick={handlePrint}
                        >
                            <Printer />
                        </Button>
                    </WrapWithTooltip>
                </div>
                {certData?.certificate ? (
                    <div ref={printRef}>
                        <Certificate
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
                    <Typography>Not ready yet</Typography>
                )}
            </div>
        </LearningLayout>
    );
};

type CertificateProps = {
    studentName: string;
    courseName: string;
    levelName: string;
    trainerName: string;
    completionDate: string;
    certificateId: string;
};

const Certificate = ({
    studentName,
    courseName,
    levelName,
    trainerName,
    completionDate,
    certificateId,
}: CertificateProps) => {
    const { data, refetch } = api.siteIdentity.getSiteIdentity.useQuery(
        undefined,
        { enabled: false }
    );

    useEffect(() => {
        refetch();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-10 print:py-0">
            <Card
                className="
                    printable 
                    border-4 
                    border-orange-500 dark:border-orange-400
                    shadow-2xl 
                    w-[900px] h-[650px] 
                    relative mx-auto my-10 text-center 
                    bg-no-repeat bg-[url(/certificate-bg.svg)] bg-cover 
                    text-background dark:text-white 
                    bg-white dark:bg-neutral-900
                    print:w-full print:h-auto print:shadow-none print:border-none print:bg-white print:text-black
                "
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                }}
            >
                {/* Decorative border corners */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-orange-500 dark:border-orange-400 rounded-tl-2xl print:hidden" />
                <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-orange-500 dark:border-orange-400 rounded-tr-2xl print:hidden" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-orange-500 dark:border-orange-400 rounded-bl-2xl print:hidden" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-orange-500 dark:border-orange-400 rounded-br-2xl print:hidden" />

                {/* Logo */}
                <div className="flex justify-center items-center mt-8 print:mt-4">
                    <Avatar className="w-24 h-24 border-2 border-orange-500 dark:border-orange-400 bg-white dark:bg-neutral-800 shadow print:w-20 print:h-20">
                        <AvatarImage src={data?.siteIdentity.logoPrimary} />
                        <AvatarFallback>Logo</AvatarFallback>
                    </Avatar>
                </div>

                {/* Certificate Title */}
                <CardHeader className="mt-2">
                    <CardTitle className="text-4xl font-extrabold tracking-wide text-orange-600 dark:text-orange-300 mb-2">
                        Certificate of Completion
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                        This is to certify that
                    </CardDescription>
                </CardHeader>

                {/* Student Name */}
                <CardContent>
                    <h2 className="text-3xl font-bold my-4 text-primary dark:text-orange-200 uppercase tracking-wider">
                        {studentName}
                    </h2>
                    <p className="text-lg mb-2 dark:text-gray-200">has successfully completed the course</p>
                    <h3 className="text-2xl font-semibold my-2 text-orange-700 dark:text-orange-300">{courseName}</h3>
                    <p className="text-lg mb-2 dark:text-gray-200">Level</p>
                    <h4 className="text-xl font-medium my-2 text-orange-600 dark:text-orange-200">{levelName}</h4>
                    <p className="text-lg mt-4 dark:text-gray-200">on</p>
                    <h4 className="text-lg font-semibold my-2 dark:text-orange-100">{completionDate}</h4>
                    <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
                        Certificate ID: <span className="font-mono">{certificateId}</span>
                    </p>
                </CardContent>

                {/* Signatures and Footer */}
                <CardFooter className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] flex justify-between items-end px-8 print:static print:translate-x-0 print:w-full print:px-0">
                    <div className="flex flex-col items-center">
                        <Typography variant="secondary" className="border-t border-foreground pt-2 text-base font-medium min-w-[120px] dark:text-orange-200">
                            {data?.siteIdentity.name1} {data?.siteIdentity.name2}
                        </Typography>
                        <span className="text-xs text-gray-500 dark:text-gray-300">Academy Director</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Typography variant="secondary" className="border-t border-foreground pt-2 text-base font-medium min-w-[120px] dark:text-orange-200">
                            {trainerName || "Course Instructor"}
                        </Typography>
                        <span className="text-xs text-gray-500 dark:text-gray-300">Trainer</span>
                    </div>
                </CardFooter>

                {/* Print watermark */}
                <div className="absolute bottom-2 right-4 text-xs text-gray-400 dark:text-gray-300 opacity-60 print:hidden">
                    Powered by {data?.siteIdentity.name1}
                </div>
            </Card>
        </div>
    );
};

export default CertificatePage;