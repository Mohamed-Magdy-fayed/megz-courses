import { columns } from "./CourseColumn";
import { DataTable } from "../ui/DataTable";
import { api } from "@/lib/api";
import Spinner from "../Spinner";
import { useEffect } from "react";
import { formatPercentage } from "@/lib/utils";
import { format } from "date-fns";

const CoursesClient = ({ userId }: { userId: string }) => {
  const { data, refetch } = api.courses.getStudentCourses.useQuery({ userId }, { enabled: false })

  const formattedData = data?.courses.map(({
    id,
    name,
  }) => {
    const filteredTest = data?.user.placementTests.find((test) => test.courseId === id);
    const isSubmitted = data?.user.evaluationFormSubmissions.some(sub => sub.evaluationFormId === filteredTest?.evaluationFormId)
    const studentPoints = data?.user.evaluationFormSubmissions.find(sub => sub.evaluationFormId === filteredTest?.evaluationFormId)?.rating
    const totalPoints = filteredTest?.writtenTest.totalPoints
    const isOralTestScheduled = !!filteredTest?.oralTestTime.testTime
    const oralTestTime = filteredTest?.oralTestTime.testTime || new Date()
    const status = !filteredTest ? "Waiting Placement Test"
      : !isSubmitted ? "Need Submission"
        : !isOralTestScheduled ? "Oral Test No Scheduled"
          : data?.user.courseStatus.find(status => status.courseId === id && !!status.level)?.level as string

    const user = data.user
    formatPercentage
    return {
      id,
      name,
      placementTestLink: `/placement_test/${id}`,
      isSubmitted,
      score: (studentPoints && totalPoints) ? `Score: ${formatPercentage(studentPoints / totalPoints * 100)}` : "Not Submitted",
      isOralTestScheduled,
      oralTestTime: format(oralTestTime, "PPPp"),
      status,
      group: user.zoomGroups.filter(group => group.courseId === id).map(group => ({
        userName: user.name,
        userEmail: user.email,
        groupNumber: group.groupNumber,
        meetingNumber: group.meetingNumber,
        meetingPassword: group.meetingPassword,
        isSessionOngoing: group.zoomSessions.some(session => session.sessionStatus === "ongoing"),
        ongoingSession: group.zoomSessions.find(session => session.sessionStatus === "ongoing"),
      }))[0]
    }
  })

  useEffect(() => {
    refetch()
  }, [userId])

  if (!formattedData) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

  return (
    <DataTable
      columns={columns}
      data={formattedData || []}
      setData={() => { }}
      onDelete={() => { }}
      search={{ key: "name", label: "Course Name" }}
    />
  );
};

export default CoursesClient;
