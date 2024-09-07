import { useEffect, useState } from "react"
import { Course, SalesAgent, SalesOperation } from "@prisma/client"
import { api } from "@/lib/api"
import { render } from "@react-email/render"
import { format } from "date-fns"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import Email from "@/components/emails/Email"
import SelectField from "@/components/salesOperation/SelectField"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { FormItem } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { PaperContainer } from "@/components/ui/PaperContainers"
import { Typography } from "@/components/ui/Typoghraphy"
import { useRouter } from "next/router"
import { sendWhatsAppMessage } from "@/lib/whatsApp"

const CreateQuickOrder = ({ courseData }: { courseData: Course }) => {
    const [loading, setLoading] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [name, setName] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [email, setEmail] = useState<string[]>([])

    const router = useRouter()
    const { toastError, toastSuccess } = useToast()

    const { data: siteData, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })
    const { data: usersData } = api.users.getUsers.useQuery({ userType: "student" })
    const quickOrderMutation = api.orders.quickOrder.useMutation()
    const sendEmailMutation = api.emails.sendEmail.useMutation()
    const trpcUtils = api.useContext()

    const handleQuickOrderForExistingUser = () => {
        if (!email[0]) return
        setLoading(true)
        quickOrderMutation.mutate({
            email: email[0],
            courseDetails: { courseId: courseData.id, isPrivate },
        }, {
            onSuccess: ({ order: { id, amount, orderNumber, user, course, createdAt, courseType, salesOperationId, salesOperation }, paymentLink }) => {
                const message = render(
                    <Email
                        logoUrl={siteData?.siteIdentity.logoPrimary || ""}
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={formatPrice(amount)}
                        orderNumber={orderNumber}
                        paymentLink={paymentLink}
                        customerName={user.name}
                        course={{
                            courseName: course.name,
                            coursePrice: courseType.isPrivate
                                ? formatPrice(course.privatePrice)
                                : formatPrice(course.groupPrice)
                        }}
                    />, { pretty: true }
                )
                handleSendEmail({
                    email: user.email,
                    subject: `Thanks for your order ${orderNumber}`,
                    message,
                })
                toastSuccess(`Order ${orderNumber} has been submitted successfully!`)
            },
            onError: (error) => {
                toastError(error.message)
            },
        })
    }

    const handleQuickOrderForNewUser = () => {
        setLoading(true)
        quickOrderMutation.mutate({
            name,
            phone,
            courseDetails: { courseId: courseData.id, isPrivate },
        }, {
            onSuccess: ({ password, order: { id, amount, orderNumber, user, course, createdAt, courseType, salesOperationId, salesOperation }, paymentLink }) => {
                const message = render(
                    <Email
                        logoUrl={siteData?.siteIdentity.logoPrimary || ""}
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={formatPrice(amount)}
                        orderNumber={orderNumber}
                        paymentLink={paymentLink}
                        customerName={user.name}
                        course={{
                            courseName: course.name,
                            coursePrice: courseType.isPrivate
                                ? formatPrice(course.privatePrice)
                                : formatPrice(course.groupPrice)
                        }}
                    />, { pretty: true }
                )
                sendWhatsAppMessage({
                    toNumber: "201123862218",
                    textBody: `*Thanks for your order ${orderNumber}*
                    \n\nHello ${user.name}, Your order *${orderNumber}* is pending payment now for *${formatPrice(amount)}*
                    \nOrder Number: *${orderNumber}*
                    \nOrder Total: *${formatPrice(amount)}*
                    \n\nYou can proceed to payment here: *${paymentLink}*
                    \n\n*شكرًا لطلبك ${orderNumber}*
                    \n\nمرحبًا ${user.name}، طلبك *${orderNumber}* قيد الانتظار للدفع الآن بمبلغ *${formatPrice(amount)}*
                    \nرقم الطلب: *${orderNumber}*
                    \nإجمالي الطلب: *${formatPrice(amount)}*
                    \n\nيمكنك المتابعة إلى الدفع هنا: *${paymentLink}*`
                })
                handleSendEmail({
                    email: user.email,
                    subject: `Thanks for your order ${orderNumber}`,
                    message,
                })
                toastSuccess(`Order ${orderNumber} has been submitted successfully!`)
                sendWhatsAppMessage({
                    toNumber: "201123862218",
                    textBody: `Thank you for choosing us, here are your username and password for accessing the course materials.
                    \n\n*Username*: ${user.email}
                    \n*Password*: *${password}*
                    \n\nYou can change your username and password at a later time and you can access your course on this link: *${window.location.host}/my_courses/*
                    \n\nشكرا لاختيارك لنا، هتلاقي في الرسالة اسم المستخدم وكلمة السر عشان تقدر تشوف الكورس على موقعنا
                    \n\n*اسم المستخدم*: ${user.email}
                    \n*كلمة السر*: *${password}*
                    \nطبعا تقدر تغير اسم المستخدم او كلمة السر في اي وقت تحبة وتقدر تشوف محتويات الكورس من اللينك ده: *${window.location.host}/my_courses/*`
                })
            },
            onError: (error) => {
                toastError(error.message)
                setLoading(false)
            },
        })
    }

    const handleSendEmail = ({
        email,
        subject,
        message,
    }: {
        email: string,
        subject: string,
        message: string,
    }) => {
        sendEmailMutation.mutate({
            email,
            subject,
            message,
        }, {
            onError: (e) => toastError(e.message),
            onSettled: () => {
                trpcUtils.invalidate()
                    .then(() => {
                        setLoading(false)
                    })
            }
        })
    }

    useEffect(() => { refetch() }, [])

    return (
        <div className="grid grid-cols-2 items-center justify-between gap-4">
            <PaperContainer className="p-4 space-y-4 h-full">
                <Typography variant={"primary"}>New Student Quick Order</Typography>
                <div>
                    <Label htmlFor="name">Student Name</Label>
                    <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="name">Student Phone</Label>
                    <Input placeholder="01234567899" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <FormItem className="flex items-center gap-2 p-2">
                    <Checkbox
                        checked={isPrivate}
                        onCheckedChange={(val) => setIsPrivate(val ? true : false)}
                    />
                    <Label className="!m-0">Private Class?</Label>
                </FormItem>
                <div className="space-x-2 mt-auto flex">
                    <Button disabled={loading} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                        setEmail([])
                    }}>
                        Clear
                    </Button>
                    <Button disabled={loading} onClick={handleQuickOrderForNewUser}>
                        Quick Order
                    </Button>
                </div>
            </PaperContainer>
            <PaperContainer className="p-4 space-y-4 h-full">
                <Typography variant={"primary"}>Existing Student Quick Order</Typography>
                <div className="space-y-4 [&>*]:w-full">
                    {!usersData?.users ? (<></>) : (
                        <SelectField
                            values={email}
                            setValues={setEmail}
                            placeholder="Select User..."
                            listTitle="Users"
                            data={usersData.users.map(user => ({ label: user.name, value: user.email, active: true }))} />
                    )}
                </div>
                <FormItem className="flex items-center gap-2 p-2">
                    <Checkbox
                        checked={isPrivate}
                        onCheckedChange={(val) => setIsPrivate(val ? true : false)}
                    />
                    <Label className="!m-0">Private Class?</Label>
                </FormItem>
                <div className="space-x-2 mt-auto flex">
                    <Button disabled={loading} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                        setEmail([])
                    }}>
                        Clear
                    </Button>
                    <Button disabled={loading} onClick={handleQuickOrderForExistingUser}>
                        Quick Order
                    </Button>
                </div>
            </PaperContainer>

        </div>
    )
}

export default CreateQuickOrder