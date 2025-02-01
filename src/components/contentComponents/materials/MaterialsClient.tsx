import { DataTable } from "@/components/ui/DataTable";
import { api } from "@/lib/api";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { MaterialsRow, columns } from "@/components/contentComponents/materials/MaterialsColumn";
import { validMaterialItemTypes } from "@/lib/enumsTypes";
import { createMutationOptions } from "@/lib/mutationsHelper";

const MaterialsClient = ({ formattedData }: { formattedData: MaterialsRow[] }) => {
    const [materialItems, setMaterialItems] = useState<string[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toastError, toastSuccess, toast } = useToast()
    const trpcUtils = api.useUtils()
    const importMutation = api.materials.importMaterials.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ materialItems }) => {
                return `${materialItems.length} materials Created`
            },
            loadingMessage: "Importing...",
        })
    )
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
            searches={[{ key: "title", label: "Title" }, { key: "sessionOrder", label: "No." }]}
            filters={[
                { key: "levelSlug", filterName: "Level", values: formattedData[0]?.levelSlugs || [] },
                {
                    key: "type", filterName: "Type", values: validMaterialItemTypes.map(type => ({
                        label: type === "Upload" ? "Downloadable" : "Interactive",
                        value: type,
                    })) || []
                },
            ]}
            dateRanges={[{ key: "createdAt", label: "Created On" }]}
            exportConfig={{
                fileName: `${formattedData[0]?.courseSlug} course materials`,
                sheetName: "Material Items",
            }}
            importConfig={{
                reqiredFields: ["slug", "subTitle", "levelSlug", "title", "type"],
                sheetName: "Materials",
                templateName: "Materials Import Template",
            }}
            handleImport={(data) => {
                importMutation.mutate({
                    courseSlug: formattedData[0]?.courseSlug!,
                    data: data.map(({ levelSlug, slug, subTitle, title, type, sessionOrder }) => ({
                        levelSlug,
                        slug,
                        sessionOrder,
                        subTitle,
                        title,
                        type,
                    }))
                })
            }}
        />
    );
};

export default MaterialsClient;
