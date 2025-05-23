import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { api } from "@/lib/api";
import { formatPercentage } from "@/lib/utils";
import { preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import PlacmentTestScheduleClient from "@/components/admin/systemManagement/contentComponents/placmentTestSchedule/PlacmentTestScheduleClient";
import AutomaticModal from "@/components/ui/automaticModal";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import SchedulePlacementTestModalContent from "@/components/general/modals/SchedulePlacementTestModalContent";
import { useState } from "react";

const PlacementTestsPage = () => {
    const [isGetAll, setIsGetAll] = useState(false)
    const { data, isLoading } = api.placementTests.getAllPlacementTests.useQuery({ isGetAll })

    return (
        <AppLayout actions={[{ label: "Show All", onClick: () => { setIsGetAll(true) }, icon: <MoreHorizontalIcon size={20} /> }]}>
            <main className="flex">
                <div className="flex w-full flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2">
                            <ConceptTitle>Placement Tests</ConceptTitle>
                        </div>
                        <AutomaticModal
                            trigger={(
                                <Button>
                                    <PlusIcon className="mr-2"></PlusIcon>
                                    <Typography variant={"buttonText"}>Create</Typography>
                                </Button>
                            )}
                            title="Create placement test"
                            description="You can see all the users that still needs a placement test"
                            children={<SchedulePlacementTestModalContent />}
                        />
                    </div>
                    <PlacmentTestScheduleClient isLoading={isLoading} formattedData={data?.tests.map(({
                        id,
                        student,
                        course,
                        oralTestTime,
                        // oralTestMeeting,
                        zoomSessions,
                        tester,
                        writtenTest,
                        courseId,
                        createdAt,
                        updatedAt,
                    }) => {
                        const test = writtenTest
                        const submission = writtenTest.submissions.find(sub => sub.studentId === student.id)
                        const link = `${window.location.host}/placement_test/${course.slug}`
                        const zoomSession = zoomSessions.find(s => s.sessionStatus !== "Cancelled")
                        const oralTestLink = preMeetingLinkConstructor({
                            isZoom: !zoomSession?.zoomClient?.isZoom,
                            meetingNumber: zoomSession?.meetingNumber || "",
                            meetingPassword: zoomSession?.meetingPassword || "",
                            sessionTitle: `Placement Test for course ${course.name}`,
                            sessionId: zoomSession?.id
                        })

                        return ({
                            id,
                            isLevelSubmitted: student.courseStatus.some(status => status.courseId === test.courseId && !!status.level) ? "Completed" : "Pending",
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
                            // oralTestMeeting,
                            oralTestLink,
                            oralTestQuestions: writtenTest.oralTestQuestions,
                            testLink: `/student/placement_test/${course.slug}`,
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
                </div>
            </main>
        </AppLayout>
    );
};

export default PlacementTestsPage;
