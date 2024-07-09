import Spinner from "@/components/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type Column, columns } from "./AssignmentsColumn";
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const AssignmentsClient = ({ courseId }: { courseId: string }) => {
    const { data, isLoading } = api.evaluationForm.getEvalFormsAssginments.useQuery({ courseId })

    const { toastSuccess, toastError } = useToast()
    const [ids, setIds] = useState<string[]>([])

    const formattedData: Column[] = data?.assignments ? data.assignments.map(({
        id,
        materialItem,
        questions,
        submissions,
        totalPoints,
        createdBy,
        createdAt,
        updatedAt,
    }) => ({
        id,
        materialItemTitle: materialItem?.title || "",
        questions: questions.length,
        submissions: submissions.length,
        totalPoints,
        createdBy,
        createdAt: format(createdAt, "PPPp"),
        updatedAt: format(updatedAt, "PPPp"),
    })) : []

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation({
        onMutate: () => { },
        onError: ({ message }) => toastError(message),
        onSettled: () => { },
    })
    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids }, {
            onSuccess: (data) => {
                trpcUtils.evaluationForm.invalidate()
                    .then(() => {
                        toastSuccess(`${data.deletedEvalForms.count} forms deleted`)
                        callback?.()
                    })
            }
        })
    }

    if (!data?.assignments && isLoading) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <DataTable
            columns={columns}
            data={formattedData || []}
            setData={(data) => setIds(data.map(item => item.id))}
            onDelete={onDelete}
            search={{ key: "materialItemTitle", label: "material item" }}
        />
    );
};

export default AssignmentsClient;
