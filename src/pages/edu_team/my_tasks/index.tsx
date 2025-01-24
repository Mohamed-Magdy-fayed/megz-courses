import { ConceptTitle } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { PaperContainer } from "@/components/ui/PaperContainers";
import TesterPlacmentTestClient from "@/components/contentComponents/testerPlacmentTests/TesterPlacmentTestsClient";
import AppLayout from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { format } from "date-fns";

const MyTasksPage: NextPage = () => {
    const { data: trainerPlacementTestsData } = api.trainers.getTrainerPlacementTest.useQuery()
    const { data: testersData } = api.trainers.getTesters.useQuery()

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
                            formattedData={trainerPlacementTestsData?.tests ? trainerPlacementTestsData.tests.map(test => ({
                                id: test.id,
                                isLevelSubmittedString: test.student.courseStatus.some(status => status.courseId === test.courseId && !!status.courseLevelId) ? "Completed" : "Waiting",
                                isLevelSubmitted: test.student.courseStatus.some(status => status.courseId === test.courseId && !!status.courseLevelId),
                                level: test.student.courseStatus.find(status => status.courseId === test.courseId)?.level?.name || "",
                                courseLevels: test.course.levels,
                                courseId: test.courseId,
                                courseName: test.course.name,
                                testersData: testersData?.testers.map(tester => ({
                                    id: tester.id,
                                    name: tester.user.name,
                                })) || [],
                                studentUserId: test.student.id,
                                studentName: test.student.name,
                                studentEmail: test.student.email,
                                studentPhone: test.student.phone || "",
                                studentImage: test.student.image || "",
                                testLink: `/placement_test/${test.courseId}`,
                                testTime: test.oralTestTime,
                                isWrittenTestDone:
                                    (
                                        test.writtenTest.submissions
                                            .some(sub => sub.studentId === test.studentUserId)
                                    ) ? "true" : "false",
                                writtenTestResult:
                                    Number(
                                        test.writtenTest.submissions
                                            .find(sub => sub.studentId === test.studentUserId)?.totalScore
                                    ),
                                writtenTestTotalPoints: test.writtenTest.totalScore,
                                oralTestMeeting: test.oralTestMeeting,
                                oralTestQuestions: test.writtenTest.oralTestQuestions,
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