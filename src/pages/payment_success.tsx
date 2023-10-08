import Spinner from "@/components/Spinner"
import AppLayout from "@/components/layout/AppLayout"
import OrderReceipt from "@/components/orders/OrderReceipt"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { Course, Order, User } from "@prisma/client"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const SuccessfullPaymentPage = () => {
    const sessionId = useRouter().query.session_id
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [orderData, setOrderData] = useState<Order>()

    const payOrderMutation = api.orders.payOrder.useMutation()

    useEffect(() => {
        setLoading(true)
        if (typeof sessionId === "string") payOrderMutation.mutate({ sessionId }, {
            onSuccess: (data) => {
                setOrderData(data.updatedOrder)
                if (data.alreadyUpdated) return
                toast({
                    variant: "success",
                    title: "Order payment successfull",
                    description: `Thanks for completeing the payment for order: ${data.updatedOrder?.orderNumber}`
                })
            },
            onError: () => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Please contact support for assistance`
                })
            },
            onSettled: () => {
                setLoading(false)
            }
        })
    }, [sessionId])



    if (loading) return (
        <AppLayout>
            <div className="w-full h-full grid place-content-center">
                <Spinner />
            </div>
        </AppLayout>
    )

    return (
        <AppLayout>
            <ConceptTitle className="mb-4">Payment Successfull</ConceptTitle>
            {!orderData?.id ? (
                <div className="w-full h-full grid place-content-center">
                    <Spinner />
                </div>
            ) : (
                <OrderReceipt orderId={orderData.id} />
            )}
        </AppLayout>
    )
}

export default SuccessfullPaymentPage