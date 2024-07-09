import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./FinalTestSubmissionsColumn";

const FinalTestSubmissionsClient = ({ courseId }: { courseId: string }) => {
    const { data } = api.placementTests.getCoursePlacementTest.useQuery({ courseId })

    const formattedData: Column[] = data?.tests ? data.tests.map(({
        id,
        course,
        student,
        trainer,
        createdAt,
        updatedAt,
    }) => ({
        id,
        courseName: course.name,
        student,
        email: student.email,
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
            setData={() => { }}
            onDelete={() => { }}
            search={{ key: "email", label: "Email" }}
        />
    );
};

export default FinalTestSubmissionsClient;
