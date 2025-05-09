import { productSchema } from "@/components/admin/systemManagement/products/ProductForm";
import { ProductColumn, productColumns } from "@/components/admin/systemManagement/products/ProductsColumn";
import { DataTable } from "@/components/ui/DataTable";
import { toastType, useToast } from "@/components/ui/use-toast";
import useImportErrors from "@/hooks/useImportErrors";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useState } from "react";
import { z } from "zod";

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

    const formattedData: ProductColumn[] = data?.products
        .map(({ id, isActive, description, name, groupPrice, privatePrice, orders, createdAt, updatedAt }) => ({
            id,
            isActive: isActive ? "Active" : "Inactive",
            description,
            name,
            groupPrice, privatePrice,
            orders,
            amounts: orders.reduce((a, b) => a + b.amount, 0),
            createdAt,
            updatedAt,
        })) ?? []

    return (
        <>
            {ErrorsModal}
            <DataTable
                columns={productColumns}
                data={formattedData}
                setData={(data) => setIds(data.map(item => item.id))}
                onDelete={onDelete}
                dateRanges={[
                    { key: "createdAt", label: "Created At" },
                    { key: "updatedAt", label: "Last Update" },
                ]}
                filters={[
                    {
                        key: "isActive", filterName: "Is Active", values: [
                            { label: "Active", value: "Active" },
                            { label: "Inactive", value: "Inactive" },
                        ]
                    },
                ]}
                searches={[
                    { key: "name", label: "Product Name" },
                    { key: "privatePrice", label: "Private Price" },
                    { key: "groupPrice", label: "Group Price" },
                ]}
                sum={{ key: "amounts", label: "Orders" }}
                isLoading={isLoading}
                exportConfig={{ fileName: "Products", sheetName: "Products" }}
                importConfig={{ reqiredFields: ["name", "privatePrice", "groupPrice", "description", "isActive"], sheetName: "Products", templateName: "Products Template" }}
                handleImport={(input) => {
                    const importData = input.map(({ name, privatePrice, groupPrice, isActive, description }) => ({
                        id: "",
                        name,
                        privatePrice: Number(privatePrice),
                        groupPrice: Number(groupPrice),
                        isActive: isActive === "Active" ? true : false,
                        description: description ?? undefined,
                    }))

                    const { success, data, error } = z.array(productSchema).safeParse(importData)

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
