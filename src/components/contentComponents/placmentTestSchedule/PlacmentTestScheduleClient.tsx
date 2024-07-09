import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./PlacmentTestScheduleColumn";
import { format } from "date-fns";
import { formatPercentage } from "@/lib/utils";

const PlacmentTestScheduleClient = ({ courseId }: { courseId: string }) => {
    const { data } = api.placementTests.getCoursePlacementTest.useQuery({ courseId })

    const formattedData: Column[] = data?.tests ? data.tests.map(({
        id,
        student,
        course,
        oralTestTime,
        trainer,
        writtenTest,
        courseId,
        createdAt,
        updatedAt,
    }) => {
        const test = writtenTest
        const Submission = writtenTest.submissions.find(sub => sub.userId === student.id)
        const link = `${window.location.host}/placement_test/${courseId}`
        return ({
            id,
            isLevelSubmitted: student.courseStatus.some(status => status.courseId === test.courseId && !!status.level),
            level: student.courseStatus.find(status => status.courseId === test.courseId)?.level,
            courseLevels: course.levels,
            courseId: courseId,
            studentUserId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            studentImage: student.image,
            oralTestTiem: format(oralTestTime.testTime, "PPPp"),
            testLink: `/placement_test/${test.courseId}`,
            trainerId: trainer.user.id,
            trainerName: trainer.user.name,
            trainerEmail: trainer.user.email,
            trainerImage: trainer.user.image,
            link,
            rating: Submission
                ? formatPercentage(Submission.rating)
                : "Not Submitted",
            createdAt: format(createdAt, "Pp"),
            updatedAt: format(updatedAt, "Pp"),
        })
    }) : []

    if (!data?.tests) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
            search={{ key: "studentName", label: "Name" }}
        />
    );
};

export default PlacmentTestScheduleClient;
