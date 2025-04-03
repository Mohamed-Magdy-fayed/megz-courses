import { DataTable } from "@/components/ui/DataTable";
import { type FinalTestSubmissionRow, columns } from "./FinalTestSubmissionsColumn";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const FinalTestSubmissionsClient = ({ formattedData }: { formattedData: FinalTestSubmissionRow[] }) => {
    const [selected, setSelected] = useState<FinalTestSubmissionRow[]>([])

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemFormSubmissions.deleteSystemFormSubmission.useMutation()
    const onDelete = (cb?: () => void) => {
        deleteMutation.mutate({ ids: selected.map(item => item.id) }, {
            onError: ({ message }) => toast({ title: "Error", description: message, variant: "destructive" }),
            onSuccess: ({ deletedSubmissions: { count } }) => trpcUtils.invalidate().then(() => {
                cb?.()
                toast({ title: "Success", description: `deleted ${count} submissions!`, variant: "success" })
            })
        })
    }

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={setSelected}
            onDelete={onDelete}
            searches={[
                { key: "name", label: "Name" },
            ]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
            ]}
            dateRanges={[{ key: "createdAt", label: "Submitted At" }]}
            exportConfig={{
                fileName: `Final test submissions`,
                sheetName: "Final test submissions",
            }}
        />
    );
};

export default FinalTestSubmissionsClient;
