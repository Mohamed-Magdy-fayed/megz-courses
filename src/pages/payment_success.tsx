import Spinner from "@/components/Spinner"
import PaymentConfEmail from "@/components/emails/PaymentConfEmail"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import OrderReceipt from "@/components/orders/OrderReceipt"
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { sendWhatsAppMessage } from "@/lib/whatsApp"
import { Course, Order, SalesOperation, User } from "@prisma/client"
import { render } from "@react-email/render"
import { format } from "date-fns"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const SuccessfullPaymentPage = () => {
    const router = useRouter()
    const transactionId = router.query.id as string
    const orderNumber = router.query.merchant_order_id as string
    const { toast, toastError } = useToast()
    const [loading, setLoading] = useState(false)
    const [orderData, setOrderData] = useState<Order & {
        user: User;
        salesOperation: SalesOperation;
        course: Course;
    }>()

    const { data: siteData, refetch: refetchSiteData } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: (!!transactionId && !!orderNumber) })
    const payOrderMutation = api.orders.payOrder.useMutation()
    const sendEmailMutation = api.emails.sendZohoEmail.useMutation()
    const trpcUtils = api.useContext()

    const handleSendEmail = ({
        email,
        subject,
        message,
        courseLink,
        updatedOrder,
    }: {
        email: string,
        subject: string,
        message: string,
        courseLink: string,
        updatedOrder: (Order & {
            salesOperation: SalesOperation;
        }),
    }) => {
        if (!updatedOrder) return
        sendWhatsAppMessage({
            textBody: `Payment successfull ${updatedOrder.orderNumber} with ${updatedOrder.amount}
            \nYour can now access the content through this link: ${courseLink}`,
            toNumber: "201123862218"
        })
        sendEmailMutation.mutate({
            email,
            subject,
            html: message,
        }, {
            onError: (e) => toastError(e.message),
            onSettled: (data) => {
                toast({
                    variant: "success",
                    title: "Order payment successfull",
                    description: `Thanks for completing the payment for order: ${updatedOrder.orderNumber}`
                })
                trpcUtils.salesOperations.invalidate()
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        if (!siteData?.siteIdentity.logoPrimary) {
            refetchSiteData()
            return
        }
        setLoading(true)
        if (!!transactionId && !!orderNumber) payOrderMutation.mutate({ orderNumber, transactionId }, {
            onSuccess: (data) => {
                setOrderData(data.updatedOrder)
                if (!data.courseLink) return
                const message = render(
                    <PaymentConfEmail
                        logoUrl={siteData.siteIdentity.logoPrimary}
                        orderCreatedAt={format(data.updatedOrder.createdAt, "dd MMM yyyy")}
                        orderUpdatedAt={format(data.updatedOrder.updatedAt, "dd MMM yyyy")}
                        userEmail={data.updatedOrder.user.email}
                        orderAmount={formatPrice(data.updatedOrder.amount)}
                        orderNumber={data.updatedOrder.orderNumber}
                        courseLink={data.courseLink ? data.courseLink : ""}
                        customerName={data.updatedOrder.user.name}
                        course={{
                            courseName: data.updatedOrder.course.name,
                            coursePrice: data.updatedOrder.courseType.isPrivate
                                ? formatPrice(data.updatedOrder.course.privatePrice)
                                : formatPrice(data.updatedOrder.course.groupPrice)
                        }}
                    />, { pretty: true }
                )
                handleSendEmail({
                    email: data.updatedOrder.user.email,
                    subject: `Payment successfull ${data.updatedOrder.orderNumber}`,
                    courseLink: data.courseLink ? data.courseLink : "",
                    message,
                    updatedOrder: data.updatedOrder,
                })
            },
            onError: ({ message }) => {
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
    }, [orderNumber, transactionId, siteData?.siteIdentity.logoPrimary])

    return (
        <LandingLayout>
            <Head>
                <title>{`Order | ${!!orderNumber ? orderNumber : "Loading..."}`}</title>
                <meta name="description" content={`Order Details for order ${orderNumber}`} />
                <meta name="robots" content="index, follow" />
            </Head>
            <ConceptTitle className="mb-4">Payment Successfull</ConceptTitle>
            {loading || !orderData
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