import Spinner from "@/components/Spinner"
import AppLayout from "@/components/layout/AppLayout"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const SuccessfullPaymentPage = () => {
    const sessionId = useRouter().query.session_id
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)

    const payOrderMutation = api.orders.payOrder.useMutation()

    useEffect(() => {
        setLoading(true)
        if (typeof sessionId === "string") payOrderMutation.mutate({ sessionId }, {
            onSuccess: ({ updatedOrder }) => {
                toast({
                    variant: "success",
                    title: "Order payment successfull",
                    description: `Thanks for completeing the payment for order: ${updatedOrder.orderNumber}`
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
            <ConceptTitle>Payment Successfull</ConceptTitle>
        </AppLayout>
    )
}

export default SuccessfullPaymentPage