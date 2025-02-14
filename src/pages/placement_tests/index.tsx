import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { PaperContainer } from "@/components/ui/PaperContainers";
import AppLayout from "@/components/layout/AppLayout";
import PlacmentTestScheduleClient from "@/components/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import { api } from "@/lib/api";
import { formatPercentage } from "@/lib/utils";

const PlacementTestsPage = () => {
    const { data, isLoading } = api.placementTests.getAllPlacementTests.useQuery()

    return (
        <AppLayout>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Placement Tests</ConceptTitle>
                        </div>
                    </div>
                    <PaperContainer>
                        <PlacmentTestScheduleClient isLoading={isLoading} formattedData={data?.tests.map(({
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
                                courseName: course.name,
                                studentUserId: student.id,
                                studentName: student.name,
                                studentEmail: student.email,
                                studentImage: student.image,
                                oralTestTime,
                                oralTestMeeting,
                                oralTestQuestions: writtenTest.oralTestQuestions,
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
                        }) || []} />
                    </PaperContainer>
                </div>
            </main>
        </AppLayout>
    );
};

export default PlacementTestsPage;
