import Spinner from "@/components/Spinner"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import OrderReceipt from "@/components/orders/OrderReceipt"
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy"
import { Skeleton } from "@/components/ui/skeleton"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { Prisma } from "@prisma/client"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

type OrderDetailsType = Prisma.OrderGetPayload<{
    include: {
        user: true,
        lead: true,
        course: true,
    }
}>

const SuccessfullPaymentPage = () => {
    const router = useRouter()
    const transactionId = router.query.id as string
    const orderNumber = router.query.merchant_order_id as string
    const { toast } = useToast()
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [orderData, setOrderData] = useState<OrderDetailsType>()

    const { data: siteData, refetch: refetchSiteData } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: (!!transactionId && !!orderNumber) })
    const trpcUtils = api.useUtils()
    const payOrderMutation = api.orders.payOrder.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ updatedOrder, courseLink }) => {
                setOrderData(updatedOrder)
                if (!courseLink) return "This order is already Paid!"
                return `Thanks for completing the payment for order: ${updatedOrder.orderNumber}`
            },
        })
    )

    useEffect(() => {
        if (!siteData?.siteIdentity.logoPrimary) {
            refetchSiteData()
            return
        }
        if (!!transactionId && !!orderNumber) payOrderMutation.mutate({ orderNumber, transactionId })
    }, [orderNumber, transactionId, siteData?.siteIdentity.logoPrimary])

    return (
        <LandingLayout>
            <Head>
                <title>{`Order | ${!!orderNumber ? orderNumber : "Loading..."}`}</title>
                <meta name="description" content={`Order Details for order ${orderNumber}`} />
                <meta name="robots" content="index, follow" />
            </Head>
            <ConceptTitle className="mb-4">Payment Successfull</ConceptTitle>
            {!!loadingToast || !orderData
                ? (
                    <Skeleton className="max-w-4xl mx-auto h-96 grid place-content-center">
                        <div className="flex items-center gap-2">
                            <Spinner className="w-4 h-4" />
                            <Typography>
                                loading order data...
                            </Typography>
                        </div>
                    </Skeleton>
                ) : (
                    <OrderReceipt adminView={false} order={orderData} />
                )}
        </LandingLayout>
    )
}

export default SuccessfullPaymentPage