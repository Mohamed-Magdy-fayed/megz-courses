import { Dispatch, SetStateAction, useState } from "react"
import { api } from "@/lib/api"
import { toastType, useToast } from "@/components/ui/use-toast"
import { Button, SpinnerButton } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Typography } from "@/components/ui/Typoghraphy"
import Modal from "@/components/ui/modal"
import Link from "next/link"
import { Boxes, Copy, CopyPlus, Link2 } from "lucide-react"
import { env } from "@/env.mjs"
import SingleSelectCourses from "@/components/SingleSelectCourse"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { Prisma } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import MobileNumberInput from "@/components/ui/phone-number-input"
import WrapWithTooltip from "../ui/wrap-with-tooltip"

export type CreatedUserData = {
    email: string;
    password: string;
    leadCode: string;
    writtenTestUrl: string;
}

export type AfterSubmitData = {
    orderNumber: string;
    paymentLink: string;
    amount: number;
    password: string;
    leadCode: string;
    courseSlug: string;
    user: Prisma.UserGetPayload<{}>
}

const CreateQuickOrderModal = ({ isOpen, setIsOpen, email, name, phone, defaultCourse }: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    name?: string;
    phone?: string;
    email?: string;
    defaultCourse?: string;
}) => {
    const [courseId, setCourseId] = useState(defaultCourse || "")
    const [isPrivate, setIsPrivate] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [orderName, setOrderName] = useState(name)
    const [orderEmail, setOrderEmail] = useState(email)
    const [orderPhone, setOrderPhone] = useState(phone)
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
    const [userDetails, setUserDetails] = useState<CreatedUserData>({ email: "", password: "", leadCode: "", writtenTestUrl: "" })

    const { toastError, toastSuccess, toast } = useToast()

    const trpcUtils = api.useUtils()
    const convertLeadMutation = api.orders.quickOrder.useMutation(
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
                    leadCode: order.lead.code,
                    user,
                    paymentLink,
                })
                return `Order ${order.orderNumber} has been submitted successfully!`
            },
        })
    )

    const handleCreateOrder = () => {
        if (courseId.length === 0) return toastError("Please select a course!")
        if (!orderName || !orderEmail || !orderPhone) return toastError("Please fill the user details!")
        convertLeadMutation.mutate({
            name: orderName,
            email: orderEmail,
            phone: orderPhone,
            courseDetails: {
                courseId,
                isPrivate,
            },
        })
    }

    const handleAfterSubmit = ({
        courseSlug, password, leadCode, user
    }: AfterSubmitData) => {
        setUserDetails({ email: user.email, password, leadCode, writtenTestUrl: `${env.NEXT_PUBLIC_NEXTAUTH_URL}placement_test/${courseSlug}` })
        setOrderDetailsOpen(true)
    }

    return (
        <Modal
            title={orderDetailsOpen ? "User Details" : "Create an order"}
            description={orderDetailsOpen ? "Do you want to process the lead?" : ""}
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
                            <WrapWithTooltip text={"Copy user credentials"}>
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${userDetails.email}\n${userDetails.password}`);
                                        toastSuccess("Credentials copied to the clipboard");
                                    }}
                                    customeColor={"infoIcon"}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </WrapWithTooltip>
                        </div>
                        <Typography>You can send the written test link to the Student</Typography>
                        <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex flex-col gap-2">
                                <WrapWithTooltip text={userDetails.writtenTestUrl}>
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
                                </WrapWithTooltip>
                                <Link href={`/admin/sales_management/leads/${userDetails.leadCode}`}>
                                    <Button customeColor={"success"}>
                                        <Typography>Go to lead</Typography>
                                        <Link2 className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex flex-col gap-4 p-2">
                    <div className="flex items-center justify-between w-full gap-4">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" className="max-w-xs" placeholder="Student Name" type="text" value={orderName} onChange={(e) => setOrderName(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between w-full gap-4">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" className="max-w-xs" placeholder="Student Email" type="email" value={orderEmail} onChange={(e) => setOrderEmail(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between w-full gap-4">
                        <Label htmlFor="phone">Phone</Label>
                        <MobileNumberInput inputProps={{ id: "phone", className: "max-w-xs" }} placeholder="Student Phone" value={orderPhone || ""} setValue={(val) => setOrderPhone(val)} />
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