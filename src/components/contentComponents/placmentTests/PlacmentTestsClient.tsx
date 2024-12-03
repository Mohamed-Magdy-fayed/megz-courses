import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type PlacmentTestRow, columns } from "./PlacmentTestsColumn";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { createMutationOptions } from "@/lib/mutationsHelper";

const PlacmentTestClient = ({ formattedData }: { formattedData: PlacmentTestRow[] }) => {
    const { toast } = useToast()

    const [data, setData] = useState<PlacmentTestRow[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemForms.deleteSystemForms.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedSystemForms }) => `${deletedSystemForms.count} forms deleted`,
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(data.map(item => item.id), {
            onSuccess: () => {
                callback?.()
            }
        })
    }

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={setData}
            onDelete={onDelete}
            searches={[
                { key: "createdBy", label: "Created By" },
            ]}
            dateRanges={[{ key: "createdAt", label: "Created At" }]}
            exportConfig={{
                fileName: `${formattedData[0]?.systemForm.courseId} Placement Test`,
                sheetName: "Placement Test",
            }}
        />
    );
};

export default PlacmentTestClient;
