import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type AssignmentRow, columns } from "./AssignmentsColumn";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";

const AssignmentsClient = ({ formattedData }: { formattedData: AssignmentRow[] }) => {
    const { toastSuccess, toast } = useToast()
    const [ids, setIds] = useState<string[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()

    const trpcUtils = api.useUtils()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: (data) => {
                return `${data.deletedEvalForms.count} forms deleted`
            },
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids }, {
            onSuccess: () => {
                callback?.()
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

export default AssignmentsClient;
