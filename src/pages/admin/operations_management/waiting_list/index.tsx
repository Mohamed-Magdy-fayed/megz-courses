import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { PaperContainer } from "@/components/ui/PaperContainers";
import AppLayout from "@/components/layout/AppLayout";
import FullWaitingListClient from "@/components/fullWaitingList/FullWaitingListClient";
import { useState } from "react";
import { CourseStatuses } from "@prisma/client";
import { validCourseStatuses } from "@/lib/enumsTypes";
import { PlayCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import ResumeStudentsForm from "@/components/zoomGroupsComponents/ResumeStudentsForm";
import { Button } from "@/components/ui/button";
import { upperFirst } from "lodash";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const WaitingListPage = () => {
    const [status, setStatus] = useState<CourseStatuses>("Waiting")
    const [isResumeFormOpen, setIsResumeFormOpen] = useState(false);

    const { data: waitingList } = api.waitingList.queryFullList.useQuery({ status });

    return (
        <AppLayout>
            <main>
                <div className="flex flex-col gap-2">
                    <Tabs defaultValue="Waiting">
                        <TabsList className="flex">
                            {validCourseStatuses.map(st => (
                                <TabsTrigger key={st} value={st} onClick={() => setStatus(st)}>{upperFirst(st)}</TabsTrigger>
                            ))}
                        </TabsList>
                        {validCourseStatuses.map(st => (
                            <TabsContent key={st} value={st}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex flex-col gap-2">
                                        <ConceptTitle>{upperFirst(status)} List</ConceptTitle>
                                    </div>
                                    {status === "Postponded" && (
                                        <div className="flex flex-col gap-2">
                                            <Modal
                                                title="Resume studnets"
                                                description="move studnets to back to Waiting list"
                                                isOpen={isResumeFormOpen}
                                                onClose={() => setIsResumeFormOpen(false)}
                                                children={(
                                                    <ResumeStudentsForm setIsOpen={setIsResumeFormOpen} />
                                                )}
                                            />
                                            <Button onClick={() => {
                                                setIsResumeFormOpen(true)
                                            }}>
                                                <PlayCircle className="w-4 h-4 mr-2" />
                                                Resume students
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                    <PaperContainer>
                        <FullWaitingListClient formattedData={waitingList?.fullList.map(item => {
                            const order = item.course.orders?.find(order => order.courseId === item.course.id)

                            return ({
                                id: item.user.id,
                                name: item.user.name,
                                image: item.user.image,
                                device: item.user.device,
                                email: item.user.email,
                                phone: item.user.phone,
                                orderDate: order?.createdAt || item.createdAt,
                                isPrivate: order?.courseType.isPrivate ? "Private" : "Group",
                                courseName: item.course.name,
                                courseSlug: item.course.slug,
                                courseId: item.course.id,
                                levelSlugs: item.course?.levels.map(lvl => ({ label: lvl.name, value: lvl.slug })) || [],
                                levelSlug: item.level?.slug || "",
                                levelName: item.level?.name || "",
                                createdAt: item.createdAt,
                                updatedAt: item.updatedAt,
                            })
                        }) || []} />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
};

export default WaitingListPage;
