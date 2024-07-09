import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./TesterPlacmentTestsColumn";
import { format } from "date-fns";
import { useState } from "react";

const TesterPlacmentTestClient = () => {
    const { data: trainerPlacementTestsData } = api.evaluationForm.getTrainerPlacementTest.useQuery()

    const [placementTests, setPlacementTests] = useState<Column[]>([])

    const formattedData: Column[] = trainerPlacementTestsData?.placementTests ? trainerPlacementTestsData.placementTests.map(test => ({
        id: test.id,
        isLevelSubmittedString: test.student.courseStatus.some(status => status.courseId === test.courseId && !!status.level) ? "Completed" : "Waiting",
        isLevelSubmitted: test.student.courseStatus.some(status => status.courseId === test.courseId && !!status.level),
        level: test.student.courseStatus.find(status => status.courseId === test.courseId)?.level,
        courseLevels: test.course.levels,
        courseId: test.courseId,
        studentUserId: test.student.id,
        studentName: test.student.name,
        studentEmail: test.student.email,
        studentPhone: test.student.phone || "",
        studentImage: test.student.image || "",
        testLink: `/placement_test/${test.courseId}`,
        testTime: format(test.oralTestTime.testTime, "PPPPp"),
        isWrittenTestDone: test.writtenTest.submissions.some(sub => sub.userId === test.studentUserId),
        writtenTestResult: test.writtenTest.submissions.find(sub => sub.userId === test.studentUserId)?.rating,
        writtenTestTotalPoints: test.writtenTest.totalPoints,
        createdBy: test.writtenTest.createdBy,
        createdAt: format(test.createdAt, "PPPp"),
        updatedAt: format(test.updatedAt, "PPPp"),
    })) : []

    if (!trainerPlacementTestsData?.placementTests) return <></>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={setPlacementTests}
            onDelete={() => { }}
            filters={[{ key: "isLevelSubmittedString", label: "Completed", values: ["Completed", "Waiting"] }]}
        />
    );
};

export default TesterPlacmentTestClient;
