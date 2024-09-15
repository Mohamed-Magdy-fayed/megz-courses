import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type FinalTestRow, columns } from "./FinalTestsColumn";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const FinalTestClient = ({ formattedData }: { formattedData: FinalTestRow[] }) => {
    const { toastSuccess, toastError } = useToast()

    const [ids, setIds] = useState<string[]>([])

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation()

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids }, {
            onSuccess: (data) => {
                trpcUtils.courses.invalidate()
                    .then(() => {
                        toastSuccess(`${data.deletedEvalForms.count} forms deleted`)
                        callback?.()
                    })
            },
            onError: ({ message }) => toastError(message),
        })
    }

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={(data) => setIds(data.map(item => item.id))}
            onDelete={onDelete}
            searches={[
                { key: "createdBy", label: "Created By" },
            ]}
            dateRange={{ key: "createdAt", label: "Created At" }}
            filters={[
                {
                    key: "levelName", filterName: "Level", values: formattedData.map(d => ({
                        value: d.levelName,
                        label: d.levelName,
                    }))
                },
            ]}
        />
    );
};

export default FinalTestClient;
