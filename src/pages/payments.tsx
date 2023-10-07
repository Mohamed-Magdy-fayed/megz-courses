import Spinner from "@/components/Spinner"
import { useToast } from "@/components/ui/use-toast"
import getStripe from "@/lib/getStripe"
import { useRouter } from "next/router"
import { useEffect } from "react"

const RedirectToPaymentPage = () => {
    const sessionId = useRouter().query.sessionId
    const { toast } = useToast()

    const RedirectToCheckout = async (sessionId: string) => {
        const stripe = await getStripe()
        const { error } = await stripe!.redirectToCheckout({
            sessionId,
        })
        toast({
            variant: "destructive",
            title: 'redirectToCheckoutfailed',
            description: error.message
        })
    }

    useEffect(() => {
        if (sessionId && typeof sessionId === "string") {
            RedirectToCheckout(sessionId)
        }
    }, [sessionId])

    return (
        <div className="h-screen w-screen grid place-content-center">
            <Spinner />
        </div>
    )
}

export default RedirectToPaymentPage