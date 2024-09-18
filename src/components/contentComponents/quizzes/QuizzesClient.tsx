import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type QuizRow, columns } from "./QuizzesColumn";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const QuizzesClient = ({ formattedData }: { formattedData: QuizRow[] }) => {
    const { toastSuccess, toastError } = useToast()
    const [ids, setIds] = useState<string[]>([])

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation({
        onError: ({ message }) => toastError(message),
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

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={(data) => setIds(data.map(item => item.id))}
            onDelete={onDelete}
            searches={[{ key: "materialItemTitle", label: "Material Title" }]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
                {
                    key: "googleFormTitle", filterName: "Form type", values: formattedData
                        .map(d => d.googleFormTitle)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .map(title => ({ label: title, value: title }))
                },
                {
                    key: "createdBy", filterName: "Created By", values: [...formattedData.map(d => ({
                        label: d.createdBy,
                        value: d.createdBy,
                    }))]
                },
            ]}
            dateRanges={[{ key: "createdAt", label: "Created On" }]}
        />
    );
};

export default QuizzesClient;
