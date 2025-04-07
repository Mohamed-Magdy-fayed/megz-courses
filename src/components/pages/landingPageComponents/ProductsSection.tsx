import LandingProductCard from "@/components/student/courses/LandingProductCard"
import Spinner from "@/components/ui/Spinner"
import { api } from "@/lib/api"
import { useEffect } from "react"

const ProductsSection = () => {
    const { data, isLoading, refetch } = api.products.getLatest.useQuery(undefined, { enabled: false })

    useEffect(() => {
        refetch()
    }, [])

    return (
        <div className="grid grid-cols-12">
            {isLoading && <div className="col-span-12 p-4 flex justify-center items-center"><Spinner /></div>}
            {data?.products && data.products.slice(0, 6).map(product => (
                <LandingProductCard
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    )
}

export default ProductsSection