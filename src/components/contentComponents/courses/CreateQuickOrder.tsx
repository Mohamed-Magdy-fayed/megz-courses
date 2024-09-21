import { useEffect, useState } from "react"
import { Course } from "@prisma/client"
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
import { sendWhatsAppMessage } from "@/lib/whatsApp"
import MobileNumberInput from "@/components/ui/phone-number-input"
import { useRouter } from "next/router"
import Modal from "@/components/ui/modal"
import Link from "next/link"
import { Copy, CopyPlus, Link2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { env } from "@/env.mjs"

const CreateQuickOrder = ({ courseData }: { courseData: Course }) => {
    const [loading, setLoading] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [quickOrderOpen, setQuickOrderOpen] = useState(false)
    const [userDetails, setUserDetails] = useState<{
        email: string,
        password: string,
        salesOperationCode: string,
        writtenTestUrl: string,
    }>({ email: "", password: "", salesOperationCode: "", writtenTestUrl: "" })
    const [name, setName] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [email, setEmail] = useState<string[]>([])

    const { toastError, toastSuccess } = useToast()

    const { data: siteData, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })
    const { data: usersData } = api.users.getUsers.useQuery({ userType: "student" })
    const quickOrderMutation = api.orders.quickOrder.useMutation()
    const sendEmailMutation = api.emails.sendZohoEmail.useMutation()
    const router = useRouter()

    const handleQuickOrderForExistingUser = () => {
        if (!email[0]) return
        setLoading(true)
        quickOrderMutation.mutate({
            email: email[0],
            courseDetails: { courseId: courseData.id, isPrivate },
        }, {
            onSuccess: ({ order: { id, amount, orderNumber, user, course, createdAt, courseType, salesOperationId, salesOperation }, paymentLink }) => {
                setLoading(false)
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
                setLoading(false)
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
                setUserDetails({ email: user.email, password, salesOperationCode: salesOperation.code, writtenTestUrl: `${env.NEXT_PUBLIC_NEXTAUTH_URL}placement_test/${course.slug}` })
                setQuickOrderOpen(true)
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
            html: message,
        }, {
            onError: (e) => toastError(e.message),
        })
    }

    useEffect(() => { refetch() }, [])

    return (
        <div className="grid grid-cols-2 items-center justify-between gap-4">
            <Modal
                title="User Details"
                description="Do you want to process the sales operation?"
                isOpen={quickOrderOpen}
                onClose={() => setQuickOrderOpen(false)}
                children={(
                    <div className="flex flex-col gap-4 p-2">
                        <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex flex-col gap-2">
                                <Typography>Email</Typography>
                                <Typography>Password</Typography>
                            </div>
                            <div
                                onDoubleClick={() => {
                                    navigator.clipboard.writeText(`${userDetails.email}\n${userDetails.password}`);
                                    toastSuccess("Credentials copied to the clipboard");
                                }}
                                className="flex flex-col gap-2 bg-primary/10 border border-primary rounded-lg p-2"
                            >
                                <Typography>{userDetails.email}</Typography>
                                <Typography>{userDetails.password}</Typography>
                            </div>
                        </div>
                        <Typography>You can send the written test link to the student</Typography>
                        <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex flex-col gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(userDetails.writtenTestUrl);
                                                toastSuccess("Link copied to the clipboard");
                                            }}
                                            customeColor={"infoIcon"}
                                        >
                                            <Typography>Click to copy the Link</Typography>
                                            <CopyPlus className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <Typography>
                                            {userDetails.writtenTestUrl}
                                        </Typography>
                                    </TooltipContent>
                                </Tooltip>
                                <Link href={`/sales_operations/${userDetails.salesOperationCode}`}>
                                    <Button customeColor={"success"}>
                                        <Typography>Go to sales operation</Typography>
                                        <Link2 className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${userDetails.email}\n${userDetails.password}`);
                                            toastSuccess("Credentials copied to the clipboard");
                                        }}
                                        customeColor={"infoIcon"}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <Typography>Copy user credentials</Typography>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                )}
            />
            <PaperContainer className="p-4 space-y-4 h-full">
                <Typography variant={"primary"}>New Student Quick Order</Typography>
                <div>
                    <Label htmlFor="name">Student Name</Label>
                    <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="name">Student Phone</Label>
                    <MobileNumberInput placeholder="01234567899" value={phone} setValue={setPhone} />
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