import { myCoursesColumns, MyCoursesRow } from "@/components/student/myCoursesComponents/MyCoursesColumn";
import { DataTable } from "@/components/ui/DataTable";
import { DisplayError } from "@/components/ui/display-error";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatPercentage } from "@/lib/utils";
import { useSession } from "next-auth/react";

const MyCoursesClient = () => {
    const session = useSession()

    const { data, isLoading, isError, error } = api.courses.getStudentCourses.useQuery(undefined, { enabled: !!session.data?.user.emailVerified, retry: () => false })

    const formattedData: MyCoursesRow[] = data?.courses ? data?.courses.map(({
        id,
        slug,
        name,
        systemForms,
    }) => {
        const filteredTest = systemForms.find((form) => form.type === "PlacementTest");
        const oralTest = data?.user.placementTests.find((test) => test.courseId === id);
        const isSubmitted = data?.user.systemFormSubmissions.some(sub => sub.systemFormId === filteredTest?.id)
        const studentPoints = data?.user.systemFormSubmissions.find(sub => sub.systemFormId === filteredTest?.id)?.totalScore
        const totalPoints = filteredTest?.totalScore
        const oralTestSubmission = data.user.courseStatus.find(status => status.courseId === id)
        const isOralTestScheduled = data?.user.placementTests.length !== 0
        const oralTestTime = oralTest?.oralTestTime || new Date()
        const levelName = oralTestSubmission?.level?.name
        const status = oralTestSubmission?.status || "Postponded"
        const user = data.user

        return {
            id,
            slug,
            name,
            placementTestLink: `/student/placement_test/${slug}`,
            isSubmitted,
            score: isSubmitted ? `Score: ${formatPercentage((studentPoints || 0) / (totalPoints || 0) * 100)}` : "Not Submitted",
            isOralTestScheduled,
            oralTestTime,
            levelName,
            status,
            group: user.zoomGroups.filter(group => group.courseId === id).map(group => {
                const session = group.zoomSessions.find(session => session.sessionStatus === "Ongoing")

                return ({
                    userName: user.name,
                    userEmail: user.email,
                    groupNumber: group.groupNumber,
                    isSessionOngoing: !!session,
                    ongoingSession: {
                        isZoom: !!session?.zoomClient?.isZoom,
                        materialItemTitle: session?.materialItem?.title || "",
                        id: session?.id || "",
                        meetingNumber: session?.meetingNumber || "",
                        meetingPassword: session?.meetingPassword || "",
                    },
                })
            })[0],
        }
    }) : []


    if (isLoading) return (
        <Spinner className="mx-auto" />
    )

    if (isError && error) return (
        <DisplayError message={error.message} />
    )

    return (
        <DataTable
            isLoading={isLoading}
            columns={myCoursesColumns}
            setData={() => { }}
            data={formattedData || []}
        />
    );
};

export default MyCoursesClient;
