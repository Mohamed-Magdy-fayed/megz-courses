import { ProductItemColumn, productItemColumns } from "@/components/admin/systemManagement/products/productItems/ProductItemColumn";
import { productItemSchema } from "@/components/admin/systemManagement/products/productItems/ProductItemForm";
import { DataTable } from "@/components/ui/DataTable";
import { toastType, useToast } from "@/components/ui/use-toast";
import useImportErrors from "@/hooks/useImportErrors";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useState } from "react";
import { z } from "zod";

export default function ProductItemsClient({ productId }: { productId: string }) {
    const [ids, setIds] = useState<string[]>([])
    const { toast } = useToast()
    const { ErrorsModal, setError } = useImportErrors()
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils()
    const { data, isLoading } = api.productItems.getAll.useQuery({ productId })
    const importMutation = api.productItems.import.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.productItems,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ productItems }) => productItems.length === 0 ? "No product items imported!" : `${productItems.length} Product items imported!`,
            loadingMessage: "Importing..."
        })
    )
    const deleteMutation = api.productItems.delete.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.productItems,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ productItems }) => `${productItems.count} Products Deleted!`,
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = async (callback?: () => void) => {
        try {
            await deleteMutation.mutateAsync(ids)
            callback?.()
        } catch (error) {
            callback?.()
        }
    }

    const formattedData: ProductItemColumn[] = data?.productItems
        .map(({ id, course, level, productId, createdAt, updatedAt }) => ({
            id,
            productId,
            courseId: course.id,
            courseName: course.name,
            courseSlug: course.slug,
            levelId: level?.id,
            levelName: level?.name,
            createdAt,
            updatedAt,
        })) ?? []

    return (
        <>
            {ErrorsModal}
            <DataTable
                columns={productItemColumns}
                data={formattedData}
                setData={(data) => setIds(data.map(item => item.id))}
                onDelete={onDelete}
                dateRanges={[
                    { key: "createdAt", label: "Created At" },
                    { key: "updatedAt", label: "Last Update" },
                ]}
                filters={[
                    {
                        key: "courseId", filterName: "Course", values: formattedData.map(item => ({ label: item.courseName, value: item.courseId }))
                    },
                ]}
                searches={[
                    { key: "levelName", label: "Level" },
                ]}
                isLoading={isLoading}
                exportConfig={{ fileName: "Product Items", sheetName: "Product Items" }}
                importConfig={{ reqiredFields: ["courseId", "levelId"], sheetName: "Product Items", templateName: "Product Items Template" }}
                handleImport={(input) => {
                    const importData = input.map(({ courseId, levelId }) => ({
                        id: "",
                        productId,
                        courseId,
                        levelId,
                    }))

                    const { success, data, error } = z.array(productItemSchema).safeParse(importData)

                    if (!success) return setError({
                        isError: true,
                        lines: error.errors.map((e) => ({
                            lineNumber: Number(e.path[0]) + 1,
                            lineData: { Field: `${e.path[1]} ${e.message}` },
                            lineError: e.code
                        }))
                    })

                    importMutation.mutate(data)
                }}
            />
        </>
    )
}
