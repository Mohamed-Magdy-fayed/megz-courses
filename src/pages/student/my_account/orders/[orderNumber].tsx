import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout"
import Spinner from "@/components/ui/Spinner"
import { api } from "@/lib/api"
import { useEffect } from "react"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import OrderReceipt from "@/components/admin/salesManagement/orders/OrderReceipt"
import { DisplayError } from "@/components/ui/display-error"

const OrderPage = ({ orderNumber }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { data, refetch, isLoading, isError, error } = api.orders.getByOrderNumberPublic.useQuery({ orderNumber })

    useEffect(() => {
        if (orderNumber) refetch()
    }, [orderNumber])

    return (
        <LandingLayout>
            <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
                {isLoading && <Spinner />}
                {isError && <DisplayError message={error.message} />}
                {!isLoading && !isError && data?.order && (
                    <OrderReceipt orderNumber={orderNumber} adminView={false} />
                )}
            </div>
        </LandingLayout>
    )
}

export const getServerSideProps: GetServerSideProps<{ orderNumber: string }> = async (ctx) => {
    if (typeof ctx.query.orderNumber !== "string") return { notFound: true }

    return {
        props: {
            orderNumber: ctx.query.orderNumber,
        },
    }
}

export default OrderPage
