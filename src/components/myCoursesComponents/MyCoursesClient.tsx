import { myCoursesColumns, MyCoursesRow } from "@/components/myCoursesComponents/MyCoursesColumn";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { formatPercentage } from "@/lib/utils";
import { useSession } from "next-auth/react";

const MyCoursesClient = () => {
    const session = useSession()

    const { data, isLoading } = api.courses.getStudentCourses.useQuery(undefined, { enabled: session.data?.user.isVerified })

    const formattedData: MyCoursesRow[] = data?.courses ? data?.courses.map(({
        id,
        slug,
        name,
    }) => {
        const filteredTest = data?.user.placementTests.find((test) => test.courseId === id);
        const isSubmitted = data?.user.evaluationFormSubmissions.some(sub => sub.evaluationFormId === filteredTest?.evaluationFormId)
        const studentPoints = data?.user.evaluationFormSubmissions.find(sub => sub.evaluationFormId === filteredTest?.evaluationFormId)?.rating
        const totalPoints = filteredTest?.writtenTest.totalPoints
        const oralTestSubmission = data.user.courseStatus.find(status => status.courseId === id)
        const isOralTestScheduled = data?.user.placementTests.length !== 0
        const oralTestTime = filteredTest?.oralTestTime || new Date()
        const status = !filteredTest ? "Waiting Placement Test"
            : !isOralTestScheduled ? "Oral Test Not Scheduled"
                : !oralTestSubmission ? "Awaiting oral test result"
                    : oralTestSubmission.level?.name ? "Group ongoing"
                        : !isSubmitted ? "Need Submission" : ""
        const user = data.user

        return {
            id,
            slug,
            name,
            placementTestLink: `/placement_test/${id}`,
            isSubmitted,
            score: isSubmitted ? `Score: ${formatPercentage((studentPoints || 0) / (totalPoints || 0) * 100)}` : "Not Submitted",
            isOralTestScheduled,
            oralTestTime,
            status,
            group: user.zoomGroups.filter(group => group.courseId === id).map(group => ({
                userName: user.name,
                userEmail: user.email,
                groupNumber: group.groupNumber,
                meetingNumber: group.meetingNumber,
                meetingPassword: group.meetingPassword,
                isSessionOngoing: group.zoomSessions.some(session => session.sessionStatus === "ongoing"),
                ongoingSession: {
                    materialItemTitle: group.zoomSessions.find(session => session.sessionStatus === "ongoing")?.materialItem?.title || "",
                    id: group.zoomSessions.find(session => session.sessionStatus === "ongoing")?.id || ""
                },
            }))[0]
        }
    }) : []

    return (
        <DataTable
            skele={isLoading}
            columns={myCoursesColumns}
            setData={() => { }}
            data={formattedData || []}
        />
    );
};

export default MyCoursesClient;
