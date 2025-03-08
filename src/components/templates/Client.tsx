import { productSchema } from "@/components/admin/systemManagement/products/ProductForm";
import { Column, columns } from "@/components/templates/Column";
import { DataTable } from "@/components/ui/DataTable";
import { toastType, useToast } from "@/components/ui/use-toast";
import useImportErrors from "@/hooks/useImportErrors";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useState } from "react";
import { z } from "zod";
//template
export default function ProductsClient() {
    const [ids, setIds] = useState<string[]>([])
    const { toast } = useToast()
    const { ErrorsModal, setError } = useImportErrors()
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils()
    const { data, isLoading } = api.products.getAll.useQuery()
    const importMutation = api.products.import.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.products,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ products }) => products.length === 0 ? "No products imported!" : `${products.length} Products imported!`,
            loadingMessage: "Importing..."
        })
    )
    const deleteMutation = api.products.delete.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.products,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ products }) => `${products.count} Products Deleted!`,
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

    const formattedData: Column[] = data?.products
        .map(({ id, createdAt, updatedAt }) => ({
            id,
            createdAt,
            updatedAt,
        })) ?? []

    return (
        <>
            {ErrorsModal}
            <DataTable
                columns={columns}
                data={formattedData}
                setData={(data) => setIds(data.map(item => item.id))}
                onDelete={onDelete}
                dateRanges={[
                    { key: "createdAt", label: "Created At" },
                    { key: "updatedAt", label: "Last Update" },
                ]}
                filters={[
                ]}
                searches={[
                ]}
                skele={isLoading}
                exportConfig={{ fileName: "Products", sheetName: "Products" }}
            />
        </>
    )
}
