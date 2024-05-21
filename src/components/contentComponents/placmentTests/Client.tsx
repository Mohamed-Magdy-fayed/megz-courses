import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./Column";

const PlacmentTestClient = ({ courseId }: { courseId: string }) => {
    const { data } = api.placementTests.getCoursePlacementTest.useQuery({ courseId })

    const formattedData: Column[] = data?.tests ? data.tests.map(({
        id,
        course,
        student,
        testStatus,
        trainer,
        createdAt,
        updatedAt,
    }) => ({
        id,
        courseName: course.name,
        student,
        email: student.email,
        testStatus,
        testScore: testStatus.form && testStatus.oral ? (testStatus.form + testStatus.oral) / 2 * 100 : 0,
        trainer,
        trainerName: trainer?.user.name || "no trainer yet",
        courseId,
        createdAt,
        updatedAt,
    })) : []

    if (!data?.tests) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setUsers={() => { }}
            onDelete={() => { }}
            search={{ key: "email", label: "Email" }}
        />
    );
};

export default PlacmentTestClient;
