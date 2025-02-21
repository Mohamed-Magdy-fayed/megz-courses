import { DataTable } from "@/components/ui/DataTable";
import { type PlacmentTestScheduleRow, columns } from "./PlacmentTestScheduleColumn";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";

const PlacmentTestScheduleClient = ({ formattedData, isLoading }: { formattedData: PlacmentTestScheduleRow[], isLoading?: boolean }) => {
    const [data, setData] = useState<PlacmentTestScheduleRow[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast } = useToast()

    const trpcUtils = api.useUtils()
    const deleteMutation = api.placementTests.deletePlacementTest.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            variant: "info",
            description: (
                <Spinner className="h-4 w-4" />
            ),
            duration: 3000,
        })),
        onSuccess: () => trpcUtils.zoomAccounts.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `Session deleted successfully`,
            title: "Success"
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        },
    })

    async function onDelete(cb?: () => void) {
        await deleteMutation.mutateAsync({ ids: data.map(item => item.id) })
        cb?.()
    }

    return (
        <DataTable
            skele={isLoading}
            columns={columns}
            data={formattedData || []}
            setData={setData}
            onDelete={onDelete}
            searches={[
                { key: "studentName", label: "Student Name" },
                { key: "testerName", label: "Tester Name" },
            ]}
            dateRanges={[{ key: "oralTestTime", label: "Test Time" }]}
            exportConfig={{
                fileName: `Placement Test Schedules`,
                sheetName: "Placement Test Schedules",
            }}
        />
    );
};

export default PlacmentTestScheduleClient;
