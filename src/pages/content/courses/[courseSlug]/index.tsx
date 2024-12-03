import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { ArrowLeftToLine, ChevronDownIcon, FilePlus2Icon, PackageCheckIcon, PlusIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import UploadMaterialForm from "@/components/contentComponents/materials/uploadForm/UploadMaterialForm";
import { formatPercentage } from "@/lib/utils";
import AssignmentsTabContent from "@/components/contentComponents/assignments/AssignmentsTabContent";
import QuizzesTabContent from "@/components/contentComponents/quizzes/QuizzesTabContent";
import PlacementTestsTabContent from "@/components/contentComponents/placmentTests/PlacementTestsTabContent";
import FinalTestsTabContent from "@/components/contentComponents/finalTests/FinalTestsTabContent";
import WaitingListTabContent from "@/components/contentComponents/waitingList/WaitingListTabContent";
import CourseGroupsTabContent from "@/components/contentComponents/courseGroups/CourseGroupsTabContent";
import { CustomFormModal } from "@/components/systemForms/CustomFormModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LevelForm from "@/components/contentComponents/levels/LevelForm";
import { PaperContainer } from "@/components/ui/PaperContainers";
import LevelClient from "@/components/contentComponents/levels/LevelClient";
import MaterialsClient from "@/components/contentComponents/materials/MaterialsClient";
import CreateQuickOrderModal from "@/components/leads/CreateQuickOrderModal";

const tabs = [
    { value: "levels", label: "Levels" },
    { value: "materials", label: "Materials" },
    { value: "assignments", label: "Assignments" },
    { value: "quizzes", label: "Quizzes" },
    { value: "waiting_list", label: "Waiting list" },
    { value: "groups", label: "Groups" },
    { value: "placement_tests", label: "Placement tests" },
    { value: "final_tests", label: "Final tests" },
]

const CoursePage = () => {
    const router = useRouter();
    const courseSlug = router.query?.courseSlug as string;
    const { data, isLoading, isError } = api.courses.getBySlug.useQuery({ slug: courseSlug }, { enabled: !!courseSlug });

    const [isOpen, setIsOpen] = useState(false);
    const [isAddLevelOpen, setIsAddLevelOpen] = useState(false);
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [PlacementTest, setPlacementTest] = useState(data?.course?.systemForms.filter(form => form.type === "PlacementTest")[0]);

    useEffect(() => {
        if (!isMounted) setIsMounted(true)
    }, []);

    useEffect(() => {
        if (!data?.course) return
        setPlacementTest(data.course.systemForms.filter(form => form.type === "PlacementTest")[0])
    }, [data?.course?.systemForms]);

    if (!isMounted) return null;
    if (!data?.course) return null;

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 p-4 justify-between">
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
                        <div>
                            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" customeColor="primaryOutlined" className="flex items-center gap-4">
                                        Actions
                                        <ChevronDownIcon className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => {
                                            setIsOpen(false)
                                            setIsAddLevelOpen(true)
                                        }}>
                                            <PlusIcon />
                                            <span>Create a Level</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setIsOpen(false)
                                            setIsAddMaterialOpen(true)
                                        }}>
                                            <UploadCloudIcon />
                                            <span>Upload Material</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setIsOpen(false)
                                            setIsAddFormOpen(true)
                                        }}>
                                            <FilePlus2Icon />
                                            <span>Create a Form</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setIsOpen(false)
                                            setIsAddOrderOpen(true)
                                        }}>
                                            <PackageCheckIcon />
                                            <span>Quick Order</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                        <Trash2Icon />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                    </div>
                </div>
                <Modal
                    title="Create"
                    description="Create a new level for the course"
                    isOpen={isAddLevelOpen}
                    onClose={() => setIsAddLevelOpen(false)}
                    children={(
                        <LevelForm courseSlug={courseSlug} setIsOpen={setIsAddLevelOpen} />
                    )}
                />
                <Modal
                    title="Upload material"
                    description="Upload a material for the course"
                    isOpen={isAddMaterialOpen}
                    onClose={() => setIsAddMaterialOpen(false)}
                    children={(
                        <UploadMaterialForm setIsOpen={setIsAddMaterialOpen} />
                    )}
                />
                <CustomFormModal isOpen={isAddFormOpen} setIsOpen={setIsAddFormOpen} />
                <CreateQuickOrderModal isOpen={isAddOrderOpen} setIsOpen={setIsAddOrderOpen} />
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
                            <PaperContainer>
                                <LevelClient formattedData={data.course?.levels ? data.course.levels.map(level => ({
                                    id: level.id,
                                    name: level.name,
                                    slug: level.slug,
                                    courseSlug,
                                    createdAt: level.createdAt,
                                })) : []} />
                            </PaperContainer>
                        </TabsContent>
                        <TabsContent value="materials">
                            <PaperContainer>
                                <MaterialsClient formattedData={data.course.levels.flatMap(({ materialItems }) => materialItems).map(({
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
                                }))} />
                            </PaperContainer>
                        </TabsContent>
                        <TabsContent value="assignments">
                            <AssignmentsTabContent
                                data={data?.course.levels ? data.course.levels
                                    .flatMap(({ materialItems }) => materialItems
                                        .flatMap(item => item.systemForms)
                                        .filter(form => form.type === "Assignment"))
                                    .map(systemForm => ({
                                        id: systemForm.id,
                                        materialItemTitle: systemForm.materialItem?.title || "",
                                        levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                        levelSlug: systemForm.materialItem?.courseLevel?.slug || "",
                                        levelName: systemForm.materialItem?.courseLevel?.name || "",
                                        questions: systemForm.items.flatMap(item => item.questions).length,
                                        submissions: systemForm.submissions.length,
                                        totalPoints: systemForm.totalScore,
                                        googleFormTitle: systemForm.googleFormUrl ? "Google Form" : "System Form",
                                        systemForm,
                                        createdBy: systemForm.createdBy,
                                        createdAt: systemForm.createdAt,
                                        updatedAt: systemForm.updatedAt,
                                    })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="quizzes">
                            <QuizzesTabContent
                                data={data?.course.levels ? data.course.levels
                                    .flatMap(({ materialItems }) => materialItems
                                        .flatMap(item => item.systemForms)
                                        .filter(form => form.type === "Quiz"))
                                    .map(systemForm => ({
                                        id: systemForm.id,
                                        materialItemTitle: systemForm.materialItem?.title || "",
                                        levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                        levelSlug: systemForm.materialItem?.courseLevel?.slug || "",
                                        levelName: systemForm.materialItem?.courseLevel?.name || "",
                                        questions: systemForm.items.length,
                                        submissions: systemForm.submissions.length,
                                        totalPoints: systemForm.totalScore,
                                        googleFormTitle: systemForm.googleFormUrl ? "Google Form" : "System Form",
                                        systemForm,
                                        createdBy: systemForm.createdBy,
                                        createdAt: systemForm.createdAt,
                                        updatedAt: systemForm.updatedAt,
                                    })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="waiting_list">
                            <WaitingListTabContent
                                formattedData={data?.course.courseStatus ? data?.course.courseStatus
                                    .filter(({ status, courseId }) => status === "Waiting" && data.course?.id === courseId)
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
                                    teacherId,
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
                                    teacherId: teacherId || "",
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
                                placementTests={PlacementTest ?
                                    [{
                                        id: PlacementTest.id,
                                        questions: PlacementTest.items.length,
                                        submissions: PlacementTest.submissions.length,
                                        totalPoints: PlacementTest.totalScore,
                                        systemForm: PlacementTest,
                                        createdBy: PlacementTest.createdBy,
                                        createdAt: PlacementTest.createdAt,
                                        updatedAt: PlacementTest.updatedAt,
                                    }] : []}
                                placementTestsSchedule={data.course.placementTests
                                    .filter(test => !data.course?.courseStatus.some(s => !!s.courseLevelId && s.courseId === data.course?.id && test.studentUserId === s.userId))
                                    .map(({
                                        id,
                                        student,
                                        course,
                                        oralTestTime,
                                        oralTestMeeting,
                                        tester,
                                        writtenTest,
                                        courseId,
                                        createdAt,
                                        updatedAt,
                                    }) => {
                                        const test = writtenTest
                                        const submission = writtenTest.submissions.find(sub => sub.studentId === student.id)
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
                                            oralTestTime,
                                            oralTestMeeting,
                                            testLink: `/placement_test/${course.slug}`,
                                            testerId: tester.user.id,
                                            testerName: tester.user.name,
                                            testerEmail: tester.user.email,
                                            testerImage: tester.user.image,
                                            link,
                                            rating: submission
                                                ? formatPercentage(submission.totalScore / test.totalScore * 100)
                                                : "Not Submitted",
                                            createdAt: createdAt,
                                            updatedAt: updatedAt,
                                        })
                                    })}
                                placementTestSubmissions={PlacementTest?.submissions ? PlacementTest.submissions.map(({
                                    id,
                                    student,
                                    systemForm,
                                    totalScore,
                                    createdAt,
                                    updatedAt,
                                }) => ({
                                    id,
                                    student,
                                    studentName: student.name,
                                    rating: formatPercentage(totalScore / systemForm.totalScore * 100),
                                    createdAt,
                                    updatedAt,
                                })) : []}
                            />
                        </TabsContent>
                        <TabsContent value="final_tests" className="space-y-4">
                            <FinalTestsTabContent
                                finalTests={data?.course.levels.flatMap(lvl => lvl.systemForms).length > 0
                                    ? data?.course.levels.flatMap(lvl => lvl.systemForms).map(finalTestForm => ({
                                        id: finalTestForm.id,
                                        questions: finalTestForm.items.length,
                                        submissions: finalTestForm.submissions.length,
                                        totalPoints: finalTestForm.totalScore,
                                        courseSlug: data?.course?.slug || "",
                                        levelSlug: finalTestForm.courseLevel?.slug || "",
                                        levelName: finalTestForm.courseLevel?.name || "level",
                                        systemForm: finalTestForm,
                                        createdBy: finalTestForm.createdBy,
                                        createdAt: finalTestForm.createdAt,
                                        updatedAt: finalTestForm.updatedAt,
                                    }))
                                    : []}
                                finalTestSubmissions={data?.course.levels.flatMap(lvl => lvl.systemForms.flatMap(form => form.submissions.map(sub => ({ ...sub, systemForm: form }))))
                                    .map(({
                                        id,
                                        student,
                                        answers,
                                        systemForm,
                                        totalScore,
                                        createdAt,
                                        updatedAt,
                                    }) => ({
                                        id,
                                        answers,
                                        student,
                                        levelSlugs: data.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                        levelSlug: systemForm.courseLevel?.slug || "",
                                        certificate: student.certificates.find(cert => cert.courseLevelId === systemForm.courseLevelId),
                                        email: student.email,
                                        rating: totalScore,
                                        courseId: data.course?.id || "",
                                        courseName: data.course?.name || "",
                                        createdAt,
                                        updatedAt,
                                    })) || []}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
};

export default CoursePage;
