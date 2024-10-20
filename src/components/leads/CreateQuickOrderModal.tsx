import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { toastType, useToast } from "@/components/ui/use-toast"
import { Button, SpinnerButton } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { FormItem } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Typography } from "@/components/ui/Typoghraphy"
import { sendWhatsAppMessage } from "@/lib/whatsApp"
import MobileNumberInput from "@/components/ui/phone-number-input"
import { useRouter } from "next/router"
import Modal from "@/components/ui/modal"
import Link from "next/link"
import { Boxes, Copy, CopyPlus, Link2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { env } from "@/env.mjs"
import SingleSelectCourses from "@/components/SingleSelectCourse"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { render } from "@react-email/render"
import { CredentialsEmail } from "@/components/emails/CredintialsEmail"
import { sendZohoEmail } from "@/lib/gmailHelpers"

export type CreatedUserData = {
    email: string;
    password: string;
    salesOperationCode: string;
    writtenTestUrl: string;
}

export type AfterSubmitData = {
    orderNumber: string;
    paymentLink: string;
    amount: number;
    password: string;
    salesOperationCode: string;
    courseSlug: string;
    user: {
    }
}

const CreateQuickOrderModal = ({ isOpen, leadId, setIsOpen, email, name, phone }: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    leadId: string;
    name: string;
    phone: string;
    email: string;
}) => {
    const [courseId, setCourseId] = useState("")
    const [isPrivate, setIsPrivate] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
    const [userDetails, setUserDetails] = useState<CreatedUserData>({ email: "", password: "", salesOperationCode: "", writtenTestUrl: "" })

    const { toastError, toastSuccess, toast } = useToast()

    const { data: siteData } = api.siteIdentity.getSiteIdentity.useQuery()

    const trpcUtils = api.useUtils()
    const convertLeadMutation = api.leads.convertLead.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ order, password, paymentLink, user }) => {
                handleAfterSubmit({
                    amount: order.amount,
                    courseSlug: order.course.slug,
                    orderNumber: order.orderNumber,
                    password,
                    salesOperationCode: order.salesOperation.code,
                    user,
                    paymentLink,
                })
                return `Order ${order.orderNumber} has been submitted successfully!`
            },
        })
    )
    const sendEmailMutation = api.emails.sendZohoEmail.useMutation()
    const router = useRouter()

    const handleCreateOrder = () => {
        convertLeadMutation.mutate({
            courseId,
            email,
            isPrivate,
            name,
            phone,
            leadId,
        })
    }

    const handleAfterSubmit = ({
        amount, courseSlug, orderNumber, password, salesOperationCode, paymentLink
    }: AfterSubmitData) => {
        setUserDetails({ email, password, salesOperationCode, writtenTestUrl: `${env.NEXT_PUBLIC_NEXTAUTH_URL}placement_test/${courseSlug}` })
        setOrderDetailsOpen(true)
        const html = render(
            <CredentialsEmail
                courseLink={`${env.NEXT_PUBLIC_NEXTAUTH_URL}my_courses`}
                customerName={name}
                logoUrl={siteData?.siteIdentity.logoPrimary || ""}
                password={password}
                userEmail={email}
            />
        )

        handleSendEmail({ email, html, subject: `Your credentials for accessing the course materials` })

        if (!phone) return toastError("Couldn't send 2 whatsApp messages to the student!")
        sendWhatsAppMessage({
            toNumber: phone,
            textBody: `*Thanks for your order ${orderNumber}*
                    \n\nHello ${name}, Your order *${orderNumber}* is pending payment now for *${formatPrice(amount)}*
                    \nOrder Number: *${orderNumber}*
                    \nOrder Total: *${formatPrice(amount)}*
                    \n\nYou can proceed to payment here: *${paymentLink}*
                    \n\n*شكرًا لطلبك ${orderNumber}*
                    \n\nمرحبًا ${name}، طلبك *${orderNumber}* قيد الانتظار للدفع الآن بمبلغ *${formatPrice(amount)}*
                    \nرقم الطلب: *${orderNumber}*
                    \nإجمالي الطلب: *${formatPrice(amount)}*
                    \n\nيمكنك المتابعة إلى الدفع هنا: *${paymentLink}*`
        })
        sendWhatsAppMessage({
            toNumber: phone,
            textBody: `Thank you for choosing us, here are your username and password for accessing the course materials.
                    \n\n*Username*: ${email}
                    \n*Password*: *${password}*
                    \n\nYou can change your username and password at a later time and you can access your course on this link: *${window.location.host}/my_courses/*
                    \n\nشكرا لاختيارك لنا، هتلاقي في الرسالة اسم المستخدم وكلمة السر عشان تقدر تشوف الكورس على موقعنا
                    \n\n*اسم المستخدم*: ${email}
                    \n*كلمة السر*: *${password}*
                    \nطبعا تقدر تغير اسم المستخدم او كلمة السر في اي وقت تحبة وتقدر تشوف محتويات الكورس من اللينك ده: *${window.location.host}/my_courses/*`
        })
    }

    const handleSendEmail = ({
        email,
        subject,
        html,
    }: {
        email: string,
        subject: string,
        html: string,
    }) => {
        sendEmailMutation.mutate({
            email,
            subject,
            html,
        }, {
            onError: (e) => toastError(e.message),
        })
    }

    return (
        <Modal
            title={orderDetailsOpen ? "User Details" : "Create an order"}
            description={orderDetailsOpen ? "Do you want to process the sales operation?" : ""}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={orderDetailsOpen ? (
                (
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
                )
            ) : (
                <div className="flex flex-col gap-4 p-2">
                    <div className="flex items-center justify-between w-full gap-4">
                        <Typography>Name</Typography>
                        <Typography
                            onDoubleClick={() => {
                                navigator.clipboard.writeText(`${name}`);
                                toastSuccess("Credentials copied to the clipboard");
                            }}
                            className="w-60 truncate bg-primary/10 border border-primary rounded-lg p-2"
                        >
                            {name}
                        </Typography>
                    </div>
                    <div className="flex items-center justify-between w-full gap-4">
                        <Typography>Email</Typography>
                        <Typography
                            onDoubleClick={() => {
                                navigator.clipboard.writeText(`${email}`);
                                toastSuccess("Credentials copied to the clipboard");
                            }}
                            className="w-60 truncate bg-primary/10 border border-primary rounded-lg p-2"
                        >
                            {email}
                        </Typography>
                    </div>
                    <div className="flex items-center justify-between w-full gap-4">
                        <Typography>Phone</Typography>
                        <Typography
                            onDoubleClick={() => {
                                navigator.clipboard.writeText(`${phone}`);
                                toastSuccess("Credentials copied to the clipboard");
                            }}
                            className="w-60 truncate bg-primary/10 border border-primary rounded-lg p-2"
                        >
                            {phone}
                        </Typography>
                    </div>
                    <SingleSelectCourses
                        courseId={courseId}
                        setCourseId={setCourseId}
                        loading={!!loadingToast}
                    />
                    <div className="flex items-center gap-4">
                        <Checkbox
                            checked={isPrivate}
                            onCheckedChange={(val) => setIsPrivate(!!val)}
                        />
                        <Typography variant={"secondary"}>Private Class?</Typography>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <SpinnerButton
                            onClick={handleCreateOrder}
                            icon={Boxes}
                            isLoading={!!loadingToast}
                            text="Create Order"
                            loadingText="Creating Order..."
                        />
                    </div>
                </div>
            )}
        />
    )
}

export default CreateQuickOrderModal