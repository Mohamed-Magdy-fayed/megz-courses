import Spinner from "@/components/Spinner"
import AppLayout from "@/components/layout/AppLayout"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/router"
import { useEffect } from "react"

const FailedPaymentPage = () => {
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        toast({
            variant: "destructive",
            title: "Payment Failed!",
            description: 'payment unsuccessful please try again, or contact support if you need help.'
        })
        router.push(`/`)
    }, [router])

    return (
        <AppLayout>
            <div className="w-full h-full grid place-content-center">
                <Spinner />
            </div>
        </AppLayout>
    )
}

export default FailedPaymentPage