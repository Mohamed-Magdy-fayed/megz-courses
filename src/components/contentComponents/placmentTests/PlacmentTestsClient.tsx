import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { type PlacmentTestRow, columns } from "./PlacmentTestsColumn";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import Spinner from "@/components/Spinner";

const PlacmentTestClient = ({ formattedData }: { formattedData: PlacmentTestRow[] }) => {
    const { toastSuccess, toast } = useToast()

    const [data, setData] = useState<PlacmentTestRow[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useContext()
    const deleteMutation = api.evaluationForm.deleteEvalForm.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 3000,
            }))
        },
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

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate({ ids: data.map(item => item.id) }, {
            onSuccess: ({ deletedEvalForms }) => {
                trpcUtils.courses.invalidate()
                    .then(() => {
                        loadingToast?.update({
                            id: loadingToast.id,
                            variant: "success",
                            description: `${deletedEvalForms.count} forms deleted`,
                            title: "Success",
                        })
                        callback?.()
                    })
            }
        })
    }

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={setData}
            onDelete={onDelete}
        />
    );
};

export default PlacmentTestClient;
