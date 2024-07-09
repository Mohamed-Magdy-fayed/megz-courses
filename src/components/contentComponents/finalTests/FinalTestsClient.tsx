import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./FinalTestsColumn";
import { format } from "date-fns";

const FinalTestClient = ({ courseId }: { courseId: string }) => {
    const { data } = api.evaluationForm.getFinalTest.useQuery({ courseId })

    const formattedData: Column[] = data?.finalTest
        ? [{
            id: data.finalTest.id,
            questions: data.finalTest.questions.length,
            submissions: data.finalTest.submissions.length,
            totalPoints: data.finalTest.totalPoints,
            createdBy: data.finalTest.createdBy,
            createdAt: format(data.finalTest.createdAt, "PPPp"),
            updatedAt: format(data.finalTest.updatedAt, "PPPp"),
        }]
        : []

    if (!data?.finalTest) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={() => { }}
            onDelete={() => { }}
        />
    );
};

export default FinalTestClient;
