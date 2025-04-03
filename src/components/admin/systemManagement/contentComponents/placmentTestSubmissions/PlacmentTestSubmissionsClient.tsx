import { DataTable } from "@/components/ui/DataTable";
import { type PlacementTestSubmissionsRow, columns } from "./PlacmentTestSubmissionsColumn";
import { useState } from "react";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { toastType, useToast } from "@/components/ui/use-toast";

const PlacmentTestSubmissionsClient = ({ formattedData }: { formattedData: PlacementTestSubmissionsRow[] }) => {
    const [data, setData] = useState<PlacementTestSubmissionsRow[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>();

    const { toast } = useToast();
    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemFormSubmissions.deleteSystemFormSubmission.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: () => {
                return "Submission deleted"
            },
            loadingMessage: "Deleting..."
        })
    )

    function onDelete(callback?: () => void) {
        deleteMutation.mutate({ ids: data.map(s => s.id) }, { onSuccess: () => callback?.() })
    }

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={setData}
            onDelete={onDelete}
            searches={[
                { key: "studentName", label: "Student Name" },
            ]}
            dateRanges={[{ key: "createdAt", label: "Submitted At" }]}
            exportConfig={{
                fileName: `Placement Test Submissions`,
                sheetName: "Placement Test Submissions",
            }}
        />
    );
};

export default PlacmentTestSubmissionsClient;
