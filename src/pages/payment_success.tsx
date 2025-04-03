import Spinner from "@/components/ui/Spinner"
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy"
import { Skeleton } from "@/components/ui/skeleton"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import Head from "next/head"
import { useMemo, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import OrderReceipt from "@/components/admin/salesManagement/orders/OrderReceipt"
import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout"

export type PaymentData = {
    id: string;
    amount_cents: string;
    success: string;
    merchant_order_id: string;
};

export const getServerSideProps: GetServerSideProps<PaymentData> = async (context) => {
    const { query } = context;

    if (typeof query.id !== "string" || typeof query.amount_cents !== "string" || typeof query.success !== "string" || typeof query.merchant_order_id !== "string") {
        throw new Error(`Incorrect response! something is missing or not a string.`);
    }

    return {
        props: {
            id: query.id,
            amount_cents: query.amount_cents,
            success: query.success,
            merchant_order_id: query.merchant_order_id,
        },
    };
};

export default function SuccessfullPaymentPage({ amount_cents, id, merchant_order_id, success }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { toast } = useToast()
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { data: siteData, refetch: refetchSiteData } = api.siteIdentity.getSiteIdentity.useQuery()
    const trpcUtils = api.useUtils()
    const createMutation = api.payments.create.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ payment }) => {
                if (!payment) return "This payment is already proccessed!"
                return `Thanks for your payment of ${payment.paymentAmount} for order: ${merchant_order_id}`
            },
        })
    )

    const paymentAmount = useMemo(() => (Number(amount_cents) / 100), [amount_cents])

    // useEffect(() => {
    //     if (!siteData?.siteIdentity.logoPrimary) {
    //         refetchSiteData()
    //         return
    //     }
    //     createMutation.mutate({ orderId, paymentAmount: , paymentId: id })
    // }, [merchant_order_id, id, siteData?.siteIdentity.logoPrimary])

    return (
        <LandingLayout>
            <Head>
                <title>{`Order | ${!!merchant_order_id ? merchant_order_id : "Loading..."}`}</title>
                <meta name="description" content={`Order Details for order ${merchant_order_id}`} />
                <meta name="robots" content="index, follow" />
            </Head>
            <ConceptTitle className="mb-4">Payment Successfull</ConceptTitle>
            {!success ? (
                <Typography>Payment Failed!</Typography>
            ) : !!loadingToast
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
                    <OrderReceipt adminView={false} orderNumber={merchant_order_id} />
                )}
        </LandingLayout>
    )
}
