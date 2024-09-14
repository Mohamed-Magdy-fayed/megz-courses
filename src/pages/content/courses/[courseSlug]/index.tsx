import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { ArrowLeftToLine } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import UploadMaterialForm from "@/components/contentComponents/materials/uploadForm/UploadMaterialForm";
import CreateQuickOrder from "@/components/contentComponents/courses/CreateQuickOrder";
import CustomTestGoogleForm from "@/components/FormsComponents/CustomTestGoogleForm";
import { format } from "date-fns";
import { formatPercentage } from "@/lib/utils";
import LevelsTabContent from "@/components/contentComponents/levels/LevelsTabContent";
import MaterialsTabContent from "@/components/contentComponents/materials/MaterialsTabContent";
import AssignmentsTabContent from "@/components/contentComponents/assignments/AssignmentsTabContent";
import QuizzesTabContent from "@/components/contentComponents/quizzes/QuizzesTabContent";
import PlacementTestsTabContent from "@/components/contentComponents/placmentTests/PlacementTestsTabContent";
import FinalTestsTabContent from "@/components/contentComponents/finalTests/FinalTestsTabContent";
import WaitingListTabContent from "@/components/contentComponents/waitingList/WaitingListTabContent";
import CourseGroupsTabContent from "@/components/contentComponents/courseGroups/CourseGroupsTabContent";

const tabs = [
    { value: "levels", label: "Levels" },
    { value: "materials", label: "Materials" },
    { value: "assignments", label: "Assignments" },
    { value: "quizzes", label: "Quizzes" },
    { value: "waiting_list", label: "Waiting list" },
    { value: "groups", label: "Groups" },
    { value: "placement_tests", label: "Placement tests" },
    { value: "final_tests", label: "Final tests" },
    { value: "quick_order", label: "Quick Order" },
]

const CoursePage = () => {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;
    const { data, isLoading, isError } = api.courses.getBySlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug });

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isTestOpen, setIsTestOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [placementTest, setPlacementTest] = useState(data?.course?.evaluationForms.filter(form => form.type === "placementTest")[0]);

    useEffect(() => {
        if (!isMounted) setIsMounted(true)
    }, []);

    useEffect(() => {
        if (!data?.course) return
        setPlacementTest(data.course.evaluationForms.filter(form => form.type === "placementTest")[0])
    }, [data?.course?.evaluationForms]);

    if (!isMounted) return null;
    if (!data?.course) return null;

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Link href={`/content/`}>
                            <Button variant={"icon"} customeColor={"infoIcon"}>
                                <ArrowLeftToLine />
                            </Button>
                        </Link>
                        <ConceptTitle>{data.course.name}</ConceptTitle>
                        <Typography className="text-sm font-medium text-muted">
                            total levels: {data.course.levels.length}
                        </Typography>
                    </div>
                </div>
                <Modal
                    title="Connect Google Form"
                    description="Use a google form as an assignment or quiz"
                    isOpen={isTestOpen}
                    onClose={() => setIsTestOpen(false)}
                    children={(
                        <CustomTestGoogleForm setIsOpen={setIsTestOpen} />
                    )}
                />
                <Modal
                    description="Upload a material for the course"
                    title="Upload material"
                    isOpen={isUploadOpen}
                    onClose={() => setIsUploadOpen(false)}
                    children={(
                        <UploadMaterialForm setIsOpen={setIsUploadOpen} />
                    )}
                />

                {isLoading ? (
                    <Spinner className="w-full h-40" />
                ) : isError ? (
                    <>Error</>
                ) : !data.course?.levels ? (
                    <>No Levels yet</>
                ) : (
                    <Tabs className="w-full" defaultValue="levels" id={data.course.id}>
                        <TabsList className="w-full" >
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value="levels">
                            <LevelsTabContent
                                courseSlug={courseSlug}
                                data={data.course?.levels ? data.course.levels.map(level => ({
                                    id: level.id,
                                    name: level.name,
                                    slug: level.slug,
                                    courseSlug,
                                    createdAt: level.createdAt,
                                })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="materials">
                            <MaterialsTabContent
                                data={data.course.levels.flatMap(({ materialItems }) => materialItems).map(({
                                    id,
                                    slug,
                                    title,
                                    type,
                                    subTitle,
                                    uploads,
                                    courseLevel,
                                    createdAt,
                                    updatedAt,
                                }) => ({
                                    id,
                                    slug,
                                    subTitle: subTitle || "",
                                    uploads,
                                    materialItemSlug: slug,
                                    levelName: courseLevel?.name || "",
                                    levelSlug: courseLevel?.slug || "",
                                    levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                    title,
                                    type,
                                    courseSlug: data.course?.slug || "",
                                    createdAt,
                                    updatedAt,
                                }))}
                            />
                        </TabsContent>
                        <TabsContent value="assignments">
                            <AssignmentsTabContent
                                data={data?.course.levels ? data.course.levels
                                    .flatMap(({ materialItems }) => materialItems
                                        .flatMap(item => item.evaluationForms)
                                        .filter(form => form.type === "assignment"))
                                    .map(evalForm => ({
                                        id: evalForm.id,
                                        materialItemTitle: evalForm.materialItem?.title || "",
                                        levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                        levelSlug: evalForm.materialItem?.courseLevel?.slug || "",
                                        levelName: evalForm.materialItem?.courseLevel?.name || "",
                                        questions: evalForm.questions.length,
                                        submissions: evalForm.submissions.length,
                                        totalPoints: evalForm.totalPoints,
                                        externalLink: evalForm.externalLink,
                                        hasExternalLink: !!evalForm.externalLink ? "true" : "false",
                                        evalForm,
                                        createdBy: evalForm.createdBy,
                                        createdAt: evalForm.createdAt,
                                        updatedAt: format(evalForm.updatedAt, "PPPp"),
                                    })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="quizzes">
                            <QuizzesTabContent
                                data={data?.course.levels ? data.course.levels
                                    .flatMap(({ materialItems }) => materialItems
                                        .flatMap(item => item.evaluationForms)
                                        .filter(form => form.type === "quiz"))
                                    .map(evalForm => ({
                                        id: evalForm.id,
                                        materialItemTitle: evalForm.materialItem?.title || "",
                                        levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                        levelSlug: evalForm.materialItem?.courseLevel?.slug || "",
                                        levelName: evalForm.materialItem?.courseLevel?.name || "",
                                        questions: evalForm.questions.length,
                                        submissions: evalForm.submissions.length,
                                        totalPoints: evalForm.totalPoints,
                                        externalLink: evalForm.externalLink,
                                        hasExternalLink: !!evalForm.externalLink ? "true" : "false",
                                        evalForm,
                                        createdBy: evalForm.createdBy,
                                        createdAt: evalForm.createdAt,
                                        updatedAt: format(evalForm.updatedAt, "PPPp"),
                                    })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="waiting_list">
                            <WaitingListTabContent
                                formattedData={data?.course.courseStatus ? data?.course.courseStatus
                                    .filter(({ status, courseId }) => status === "waiting" && data.course?.id === courseId)
                                    .map(({ courseId, level, user: {
                                        id,
                                        name,
                                        image,
                                        device,
                                        email,
                                        phone,
                                        orders,
                                        createdAt,
                                        updatedAt,
                                    } }) => ({
                                        id,
                                        name,
                                        image,
                                        device,
                                        email,
                                        phone,
                                        orders,
                                        courseId,
                                        levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                        levelSlug: level?.slug || "",
                                        levelName: level?.name || "",
                                        createdAt,
                                        updatedAt,
                                    })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="groups">
                            <CourseGroupsTabContent
                                formattedData={data?.course.zoomGroups ? data.course.zoomGroups.map(({
                                    id,
                                    groupNumber,
                                    groupStatus,
                                    startDate,
                                    studentIds,
                                    trainerId,
                                    courseId,
                                    courseLevel,
                                    createdAt,
                                    updatedAt,
                                }) => ({
                                    id,
                                    groupNumber,
                                    groupStatus,
                                    startDate,
                                    studentIds,
                                    trainerId: trainerId || "",
                                    courseId: courseId || "",
                                    courseLevel: {
                                        id: courseLevel?.id || "",
                                        name: courseLevel?.name || "",
                                        slug: courseLevel?.slug || "",
                                    },
                                    levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                    levelName: courseLevel?.name || "",
                                    levelSlug: courseLevel?.slug || "",
                                    createdAt,
                                    updatedAt,
                                })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="placement_tests" className="space-y-4">
                            <PlacementTestsTabContent
                                placementTests={placementTest ?
                                    [{
                                        id: placementTest.id,
                                        questions: placementTest.questions.length,
                                        submissions: placementTest.submissions.length,
                                        totalPoints: placementTest.totalPoints,
                                        externalLink: placementTest.externalLink,
                                        evalForm: placementTest,
                                        createdBy: placementTest.createdBy,
                                        createdAt: format(placementTest.createdAt, "PPPp"),
                                        updatedAt: format(placementTest.updatedAt, "PPPp"),
                                    }] : []}
                                placementTestsSchedule={data.course.placementTests
                                    .filter(test => !test.writtenTest.submissions.some(sub => sub.userId === test.student.id))
                                    .map(({
                                        id,
                                        student,
                                        course,
                                        oralTestTime,
                                        trainer,
                                        writtenTest,
                                        courseId,
                                        createdAt,
                                        updatedAt,
                                    }) => {
                                        const test = writtenTest
                                        const submission = writtenTest.submissions.find(sub => sub.userId === student.id)
                                        const link = `${window.location.host}/placement_test/${course.slug}`

                                        return ({
                                            id,
                                            isLevelSubmitted: student.courseStatus.some(status => status.courseId === test.courseId && !!status.level),
                                            courseLevels: course.levels.map(level => ({
                                                label: level.name,
                                                value: level.id,
                                            })),
                                            courseId: courseId,
                                            studentUserId: student.id,
                                            studentName: student.name,
                                            studentEmail: student.email,
                                            studentImage: student.image,
                                            oralTestTiem: format(oralTestTime, "PPPp"),
                                            testLink: `/placement_test/${course.slug}`,
                                            trainerId: trainer.user.id,
                                            trainerName: trainer.user.name,
                                            trainerEmail: trainer.user.email,
                                            trainerImage: trainer.user.image,
                                            link,
                                            rating: submission
                                                ? formatPercentage(submission.rating / test.totalPoints * 100)
                                                : "Not Submitted",
                                            createdAt: format(createdAt, "Pp"),
                                            updatedAt: format(updatedAt, "Pp"),
                                        })
                                    })}
                                placementTestSubmissions={placementTest?.submissions ? placementTest.submissions.map(({
                                    id,
                                    student,
                                    evaluationForm,
                                    rating,
                                    createdAt,
                                    updatedAt,
                                }) => ({
                                    id,
                                    student,
                                    studentName: student.name,
                                    rating: formatPercentage(rating / evaluationForm.totalPoints * 100),
                                    createdAt,
                                    updatedAt,
                                })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="final_tests">
                            <FinalTestsTabContent
                                finalTests={data?.course.evaluationForms.filter(form => form.type === "finalTest").length > 0
                                    ? data?.course.evaluationForms.filter(form => form.type === "finalTest").map(finalTest => ({
                                        id: finalTest.id,
                                        questions: finalTest.questions.length,
                                        submissions: finalTest.submissions.length,
                                        totalPoints: finalTest.totalPoints,
                                        externalLink: finalTest.externalLink,
                                        evalForm: finalTest,
                                        createdBy: finalTest.createdBy,
                                        createdAt: format(finalTest.createdAt, "PPPp"),
                                        updatedAt: format(finalTest.updatedAt, "PPPp"),

                                    }))
                                    : []}
                                finalTestSubmissions={data?.course.evaluationForms.filter(form => form.type === "finalTest").length > 0
                                    ? data?.course.evaluationForms.filter(form => form.type === "finalTest")
                                        .flatMap(test => test.submissions)
                                        .map(({
                                            id,
                                            student,
                                            answers,
                                            evaluationForm,
                                            rating,
                                            createdAt,
                                            updatedAt,
                                        }) => ({
                                            id,
                                            answers,
                                            student,
                                            levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                            levelSlug: evaluationForm.courseLevel?.slug || "",
                                            certificate: student.certificates.find(cert => cert.courseLevelId === evaluationForm.courseLevelId),
                                            email: student.email,
                                            rating,
                                            courseId: data.course?.id || "",
                                            courseName: data.course?.name || "",
                                            evaluationForm,
                                            createdAt,
                                            updatedAt,
                                        })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="quick_order">
                            <CreateQuickOrder
                                courseData={data.course}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
};

export default CoursePage;
