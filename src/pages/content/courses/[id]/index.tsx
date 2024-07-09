import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { ArrowLeftToLine, Plus, PlusIcon, Upload } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MaterialsClient from "@/components/contentComponents/materials/MaterialsClient";
import Spinner from "@/components/Spinner";
import CreateMaterialForm from "@/components/contentComponents/materials/CreateMaterialForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import WaitingListClient from "@/components/contentComponents/waitingList/WaitingListClient";
import CourseGroupsClient from "@/components/contentComponents/courseGroups/CourseGroupsClient";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import UploadMaterialForm from "@/components/contentComponents/materials/uploadForm/UploadMaterialForm";
import CreateQuickOrder from "@/components/contentComponents/courses/CreateQuickOrder";
import AssignmentsClient from "@/components/contentComponents/assignments/AssignmentsClient";
import FinalTestClient from "@/components/contentComponents/finalTests/FinalTestsClient";
import FinalTestSubmissionsClient from "@/components/contentComponents/finalTestSubmissions/FinalTestSubmissionsClient";
import QuizzesClient from "@/components/contentComponents/quizzes/QuizzesClient";
import PlacmentTestClient from "@/components/contentComponents/placmentTests/PlacmentTestsClient";
import PlacmentTestSubmissionsClient from "@/components/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsClient";
import PlacmentTestScheduleClient from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import { PaperContainer } from "@/components/ui/PaperContainers";

const tabs = [
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
    const id = router.query?.id as string;
    const tabName = router.query.tab as string;
    const { data, isLoading, isError, error } = api.courses.getById.useQuery({ id });
    const [tab, setTab] = useState("materials");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (!isMounted) setIsMounted(true)
    }, []);

    useEffect(() => {
        if (!tabName && id) router.push(`${id}?tab=${tab}`)
        if (tabName) setTab(tabName)
    }, [tabName, id]);

    if (!isMounted) return null;

    return (
        <AppLayout>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link href={`/content`} >
                        <ArrowLeftToLine />
                    </Link>
                    <div className="flex flex-col gap-2">
                        <ConceptTitle>{data?.course?.name}</ConceptTitle>
                        <Typography className="text-sm font-medium text-gray-500">
                            total materials: {data?.course?.materialItems.length}
                        </Typography>
                    </div>
                </div>
                <Modal
                    description="Upload a material for the course"
                    isOpen={isUploadOpen}
                    onClose={() => setIsUploadOpen(false)}
                    title="Upload material"
                    children={(
                        <UploadMaterialForm id={id} setIsUploadOpen={setIsUploadOpen} />
                    )}
                />
                <Modal
                    description="Create a material for the course"
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Add material"
                    children={(
                        <CreateMaterialForm id={id} setIsOpen={setIsOpen} />
                    )}
                />
                {isLoading ? (
                    <Spinner className="w-full h-40" />
                ) : isError ? (
                    <>Error</>
                ) : !data.course?.materialItems ? (
                    <>No materials yet</>
                ) : (
                    <Tabs className="w-full" value={tab}>
                        <TabsList className="w-full" >
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    onClick={() => router.push(`${id}?tab=${tab.value}`)}
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value="materials">
                            <div className="p-4 flex gap-4 items-center">
                                <Button
                                    onClick={() => {
                                        setIsOpen(true);
                                    }}
                                >
                                    <PlusIcon className="mr-2"></PlusIcon>
                                    Add a material
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsUploadOpen(true);
                                    }}
                                >
                                    <Upload className="mr-2"></Upload>
                                    Upload a material
                                </Button>
                            </div>
                            <MaterialsClient data={data.course.materialItems} />
                        </TabsContent>
                        <TabsContent value="assignments">
                            <div className="p-4">
                                <Link href={`/content/courses/${id}/create-form`}>
                                    <Button>
                                        <Plus />
                                        <Typography>Add Assignment</Typography>
                                    </Button>
                                </Link>
                            </div>
                            <AssignmentsClient courseId={id} />
                        </TabsContent>
                        <TabsContent value="quizzes">
                            <div className="p-4">
                                <Link href={`/content/courses/${id}/create-form`}>
                                    <Button>
                                        <Plus />
                                        <Typography>Add Quiz</Typography>
                                    </Button>
                                </Link>
                            </div>
                            <QuizzesClient courseId={id} />
                        </TabsContent>
                        <TabsContent value="waiting_list">
                            <WaitingListClient courseId={data.course.id} />
                        </TabsContent>
                        <TabsContent value="groups">
                            <CourseGroupsClient zoomGroups={data.course.zoomGroup} />
                        </TabsContent>
                        <TabsContent value="placement_tests" className="space-y-4">
                            <div className="p-4">
                                <Link href={`/content/courses/${id}/create-test`}>
                                    <Button>
                                        <Plus />
                                        <Typography>Create Placement Test</Typography>
                                    </Button>
                                </Link>
                            </div>
                            <PaperContainer>
                                <Typography variant={"secondary"}>The Tests</Typography>
                                <PlacmentTestClient courseId={data.course.id} />
                            </PaperContainer>
                            <PaperContainer>
                                <Typography variant={"secondary"}>Scheduled</Typography>
                                <PlacmentTestScheduleClient courseId={data.course.id} />
                            </PaperContainer>
                            <PaperContainer>
                                <Typography variant={"secondary"}>Submissions</Typography>
                                <PlacmentTestSubmissionsClient courseId={data.course.id} />
                            </PaperContainer>
                        </TabsContent>
                        <TabsContent value="final_tests">
                            <div className="p-4">
                                <Link href={`/content/courses/${id}/create-test`}>
                                    <Button>
                                        <Plus />
                                        <Typography>Create Final Test</Typography>
                                    </Button>
                                </Link>
                            </div>
                            <FinalTestClient courseId={data.course.id} />
                            <FinalTestSubmissionsClient courseId={data.course.id} />
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
