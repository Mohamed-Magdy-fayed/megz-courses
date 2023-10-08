import Spinner from "@/components/Spinner"
import PaymentConfEmail from "@/components/emails/PaymentConfEmail"
import AppLayout from "@/components/layout/AppLayout"
import OrderReceipt from "@/components/orders/OrderReceipt"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { Course, Order, SalesOperation, User } from "@prisma/client"
import { render } from "@react-email/render"
import { format } from "date-fns"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const SuccessfullPaymentPage = () => {
    const sessionId = useRouter().query.session_id
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [orderData, setOrderData] = useState<Order & {
        user: User;
        salesOperation: SalesOperation;
        courses: Course[];
    }>()

    const payOrderMutation = api.orders.payOrder.useMutation()
    const sendEmailMutation = api.comms.sendEmail.useMutation()
    const trpcUtils = api.useContext()

    const handleSendEmail = ({
        orderId,
        email,
        subject,
        message,
        alreadyUpdated,
        updatedOrder,
    }: {
        orderId: string,
        email: string,
        subject: string,
        message: string,
        alreadyUpdated: boolean,
        updatedOrder: (Order & {
            salesOperation: SalesOperation;
        }),
    }) => {
        if (!updatedOrder) return
        sendEmailMutation.mutate({
            email,
            subject,
            message,
            orderId,
            salesOperationId: updatedOrder.salesOperationId,
            alreadyUpdated,
        }, {
            onError: (e) => toast({
                description: e.message,
                variant: "destructive",
                title: "Error"
            }),
            onSettled: (data) => {
                if (!data?.alreadyUpdated) {
                    toast({
                        variant: "success",
                        title: "Order payment successfull",
                        description: `Thanks for completeing the payment for order: ${data?.order?.orderNumber}`
                    })
                }
                trpcUtils.salesOperations.invalidate()
                setOpen(false)
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
                        orderAmount={`$${(data.updatedOrder.amount / 100).toFixed(2)}`}
                        orderNumber={data.updatedOrder.orderNumber}
                        courseLink={data.courseLink ? data.courseLink : ""}
                        customerName={data.updatedOrder.user.name}
                        courses={data.updatedOrder.courses.map(course => ({ courseName: course.name, coursePrice: `$${(course.price / 100).toFixed(2)}` }))}
                    />, { pretty: true }
                )
                handleSendEmail({
                    orderId: data.updatedOrder.id,
                    email: data.updatedOrder.user.email,
                    subject: `Payment successfull ${data.updatedOrder.orderNumber}`,
                    message,
                    alreadyUpdated: data.courseLink === null,
                    updatedOrder: data.updatedOrder,
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
                <OrderReceipt adminView={false} orderId={orderData.id} />
            )}
        </AppLayout>
    )
}

export default SuccessfullPaymentPage