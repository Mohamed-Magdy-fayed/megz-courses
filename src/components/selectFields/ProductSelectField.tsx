import SingleSelectField from "@/components/SingleSelectField";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

export default function ProductSelectField({ loading, productId, setProductId }: {
    loading: boolean;
    productId: string | undefined;
    setProductId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const { data, isLoading } = api.products.getAll.useQuery()
    return (
        <SingleSelectField
            data={data?.products.map(product => ({
                Active: true,
                label: product.name,
                value: product.id,
            })) || []}
            isLoading={loading || isLoading}
            placeholder="Select Product"
            selected={productId}
            setSelected={setProductId}
            title="Products"
        />
    )
}
