import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type AssignmentRow, columns } from "./AssignmentsColumn";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const AssignmentsClient = ({ formattedData }: { formattedData: AssignmentRow[] }) => {
    const { toastSuccess, toastError } = useToast()
    const [ids, setIds] = useState<string[]>([])

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation({
        onError: ({ message }) => toastError(message),
    })

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids }, {
            onSuccess: (data) => {
                trpcUtils.courses.invalidate()
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
                    key: "isGoogleForm", filterName: "Is Google Form", values: [
                        { label: "Has external link", value: "true" },
                        { label: "Don't have external link", value: "false" },
                    ]
                },
                {
                    key: "createdBy", filterName: "Created By", values: [...formattedData.map(d => ({
                        label: d.createdBy,
                        value: d.createdBy,
                    }))]
                },
            ]}
            dateRange={{ key: "createdAt", label: "Created On" }}
        />
    );
};

export default AssignmentsClient;
