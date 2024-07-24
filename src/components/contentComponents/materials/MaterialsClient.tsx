import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MaterialsRow, columns } from "@/components/contentComponents/materials/MaterialsColumn";

const MaterialsClient = ({ formattedData }: { formattedData: MaterialsRow[] }) => {
    const [materialItems, setMaterialItems] = useState<string[]>([])

    const { toastError, toastSuccess } = useToast()
    const trpcUtils = api.useContext()
    const deleteMutation = api.materials.deleteMaterialItems.useMutation()
    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(materialItems, {
            onSuccess: ({ deletedMaterialItems }) => {
                trpcUtils.courses.invalidate()
                    .then(() => {
                        callback?.()
                        toastSuccess(`Deleted ${deletedMaterialItems.count} materials`)
                    })
            },
            onError: ({ message }) => toastError(message)
        })
    }

    return (
        <DataTable
            columns={columns}
            data={formattedData}
            setData={(data) => setMaterialItems(data.map(item => item.id))}
            onDelete={onDelete}
            searches={[{ key: "title", label: "Title" }]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
            ]}
        />
    );
};

export default MaterialsClient;
