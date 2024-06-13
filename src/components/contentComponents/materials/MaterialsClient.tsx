import { DataTable } from "@/components/ui/DataTable";
import { MaterialsColumn, columns } from "./MaterialsColumn";
import { MaterialItem } from "@prisma/client";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const MaterialsClient = ({ data }: { data: MaterialItem[] }) => {
    const [materialItems, setMaterialItems] = useState<string[]>([])

    const formattedData: MaterialsColumn[] = data.map(({
        id,
        createdAt,
        updatedAt,
        frameWorkName,
        title,
        subTitle,
        courseId,
    }) => ({
        id,
        createdAt,
        updatedAt,
        frameWorkName,
        title,
        subTitle,
        courseId,
    }))

    const { toastError, toastSuccess } = useToast()
    const trpcUtils = api.useContext()
    const deleteMutation = api.materials.deleteMaterialItems.useMutation()
    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(materialItems, {
            onSuccess: ({ deletedMaterialItems }) => {
                trpcUtils.materials.invalidate()
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
            data={formattedData || []}
            setData={(data) => setMaterialItems(data.map(item => item.id))}
            onDelete={onDelete}
            search={{ key: "title", label: "Title" }}
        />
    );
};

export default MaterialsClient;
