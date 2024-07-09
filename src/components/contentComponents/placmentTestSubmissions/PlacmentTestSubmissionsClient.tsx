import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./PlacmentTestSubmissionsColumn";

const PlacmentTestSubmissionsClient = ({ courseId }: { courseId: string }) => {
    const { data } = api.evaluationForm.getPlacementTest.useQuery({ courseId })

    const formattedData: Column[] = data?.placementTest ? data.placementTest.submissions.map(({
        id,
        student,
        rating,
        createdAt,
        updatedAt,
    }) => ({
        id,
        student,
        studentName: student.name,
        rating,
        createdAt,
        updatedAt,
    })) : []

    if (!data?.placementTest) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

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

export default PlacmentTestSubmissionsClient;
