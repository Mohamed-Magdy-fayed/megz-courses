import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import TesterPlacmentTestClient from "@/components/contentComponents/testerPlacmentTests/TesterPlacmentTestsClient";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { format } from "date-fns";

const MyTasksPage: NextPage = () => {
    const { data: trainerPlacementTestsData } = api.evaluationForm.getTrainerPlacementTest.useQuery()
    const { data: trainersData } = api.trainers.getTrainers.useQuery()

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>My Tasks</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        <TesterPlacmentTestClient
                            formattedData={trainerPlacementTestsData?.placementTests ? trainerPlacementTestsData.placementTests.map(test => ({
                                id: test.id,
                                isLevelSubmittedString: test.student.courseStatus.some(status => status.courseId === test.courseId && !!status.courseLevelId) ? "Completed" : "Waiting",
                                isLevelSubmitted: test.student.courseStatus.some(status => status.courseId === test.courseId && !!status.courseLevelId),
                                level: test.student.courseStatus.find(status => status.courseId === test.courseId)?.level?.name || "",
                                courseLevels: test.course.levels,
                                courseId: test.courseId,
                                courseName: test.course.name,
                                trainersData: trainersData?.trainers.map(trainer => ({
                                    id: trainer.id,
                                    name: trainer.user.name,
                                })) || [],
                                studentUserId: test.student.id,
                                studentName: test.student.name,
                                studentEmail: test.student.email,
                                studentPhone: test.student.phone || "",
                                studentImage: test.student.image || "",
                                testLink: `/placement_test/${test.courseId}`,
                                testTime: test.oralTestTime,
                                isWrittenTestDone: test.writtenTest.submissions.some(sub => sub.userId === test.studentUserId) ? "true" : "false",
                                writtenTestResult: test.writtenTest.submissions.find(sub => sub.userId === test.studentUserId)?.rating,
                                writtenTestTotalPoints: test.writtenTest.totalPoints,
                                oralTestMeeting: test.oralTestMeeting,
                                createdBy: test.createdBy?.name || "Null",
                                createdAt: format(test.createdAt, "PPPp"),
                                updatedAt: format(test.updatedAt, "PPPp"),
                            })) : []}
                        />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
}

export default MyTasksPage