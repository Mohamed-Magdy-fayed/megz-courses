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
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const SuccessfullPaymentPage = () => {
    const sessionId = useRouter().query.session_id
    const { toast, toastError } = useToast()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [orderData, setOrderData] = useState<Order & {
        user: User;
        salesOperation: SalesOperation;
        courses: Course[];
    }>()

    const payOrderMutation = api.orders.payOrder.useMutation()
    const sendEmailMutation = api.emails.sendEmail.useMutation()
    const trpcUtils = api.useContext()

    const handleSendEmail = ({
        orderId,
        email,
        subject,
        message,
        courseLink,
        alreadyUpdated,
        updatedOrder,
    }: {
        orderId: string,
        email: string,
        subject: string,
        message: string,
        courseLink: string,
        alreadyUpdated: boolean,
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
            message,
            orderId,
            salesOperationId: updatedOrder.salesOperationId,
            alreadyUpdated,
        }, {
            onError: (e) => toastError(e.message),
            onSettled: (data) => {
                if (!data?.alreadyUpdated) {
                    toast({
                        variant: "success",
                        title: "Order payment successfull",
                        description: `Thanks for completeing the payment for order: ${data?.order?.orderNumber}`
                    })
                }
                trpcUtils.salesOperations.invalidate()
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        setLoading(true)
        if (typeof sessionId === "string") payOrderMutation.mutate({ sessionId }, {
            onSuccess: (data) => {
                setOrderData(data.updatedOrder)
                const message = render(
                    <PaymentConfEmail
                        orderCreatedAt={format(data.updatedOrder.createdAt, "dd MMM yyyy")}
                        orderUpdatedAt={format(data.updatedOrder.updatedAt, "dd MMM yyyy")}
                        userEmail={data.updatedOrder.user.email}
                        orderAmount={formatPrice(data.updatedOrder.amount)}
                        orderNumber={data.updatedOrder.orderNumber}
                        courseLink={data.courseLink ? data.courseLink : ""}
                        customerName={data.updatedOrder.user.name}
                        courses={data.updatedOrder.courses.map(course => ({
                            courseName: course.name,
                            coursePrice: data.updatedOrder.courseTypes.find(type => type.id === course.id)?.isPrivate
                                ? formatPrice(course.privatePrice)
                                : formatPrice(course.groupPrice)
                        }))}
                    />, { pretty: true }
                )
                handleSendEmail({
                    orderId: data.updatedOrder.id,
                    email: data.updatedOrder.user.email,
                    subject: `Payment successfull ${data.updatedOrder.orderNumber}`,
                    courseLink: data.courseLink ? data.courseLink : "",
                    message,
                    alreadyUpdated: data.courseLink === null,
                    updatedOrder: data.updatedOrder,
                })
            },
            onError: ({ message }) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: `Please contact support for assistance`
                })
                setError(message)
            },
            onSettled: () => {
                setLoading(false)
            }
        })
    }, [sessionId])

    return (
        <LandingLayout>
            <ConceptTitle className="mb-4">Payment Successfull</ConceptTitle>
            {loading
                ? (
                    <Skeleton className="max-w-4xl mx-auto h-96 grid place-content-center">
                        <div className="flex items-center gap-2">
                            <Spinner className="w-4 h-4" />
                            <Typography>
                                loading order data...
                            </Typography>
                        </div>
                    </Skeleton>
                )
                : !orderData
                    ? (
                        <>Error: {error}</>
                    )
                    : (
                        <OrderReceipt adminView={false} order={orderData} />
                    )}
        </LandingLayout>
    )
}

export default SuccessfullPaymentPage