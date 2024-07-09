import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./PlacmentTestsColumn";
import { format } from "date-fns";

const PlacmentTestClient = ({ courseId, userId }: { courseId?: string; userId?: string }) => {
    const { data } = api.evaluationForm.getPlacementTest.useQuery({ courseId: courseId! }, { enabled: !!courseId })

    const formattedData: Column[] = data?.placementTest ?
        [{
            id: data.placementTest.id,
            questions: data.placementTest.questions.length,
            submissions: data.placementTest.submissions.length,
            totalPoints: data.placementTest.totalPoints,
            createdBy: data.placementTest.createdBy,
            createdAt: format(data.placementTest.createdAt, "PPPp"),
            updatedAt: format(data.placementTest.updatedAt, "PPPp"),
        }] : []

    if (!data?.placementTest && courseId) return <></>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
        />
    );
};

export default PlacmentTestClient;
