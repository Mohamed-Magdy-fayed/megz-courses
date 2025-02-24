import SingleSelectCourses from '@/components/SingleSelectCourse'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Modal from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { toastType, useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { createMutationOptions } from '@/lib/mutationsHelper'
import { Dispatch, SetStateAction, useState } from 'react'
import { AfterSubmitData, CreatedUserData } from '../leads/CreateQuickOrderModal'
import { env } from '@/env.mjs'
import { Copy, CopyPlus, Link, Link2 } from 'lucide-react'
import { Typography } from '../ui/Typoghraphy'
import WrapWithTooltip from '../ui/wrap-with-tooltip'

const CreateOrderModal = ({ leadId, email, isOpen, setIsOpen }: {
    leadId?: string;
    email: string | undefined;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const [courseId, setCourseId] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [loadingToast, setLoadingToast] = useState<toastType>();
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
    const [userDetails, setUserDetails] = useState<CreatedUserData>({ email: "", password: "", leadCode: "", writtenTestUrl: "" })

    const { toastSuccess, toast } = useToast()
    const trpcUtils = api.useUtils()

    const createOrderMutation = api.orders.createOrder.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ orderNumber }) => {
                setIsOpen(false)
                return `Order ${orderNumber} Created successfully!`
            }
        })
    )

    const createOrderWithLeadMutation = api.orders.createOrderWithLead.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            successMessageFormatter: ({ order }) => {
                setIsOpen(false)
                handleAfterSubmit?.({
                    amount: order.amount,
                    courseSlug: order.course.slug,
                    orderNumber: order.orderNumber,
                    password: "Pass.12",
                    leadCode: order.lead.code,
                    user: order.user,
                    paymentLink: order.paymentLink || "",
                })
                return `Order ${order.orderNumber} Created successfully!`
            }
        })
    )

    const handleAfterSubmit = ({
        courseSlug, password, leadCode, user
    }: AfterSubmitData) => {
        setUserDetails({ email: user.email, password, leadCode, writtenTestUrl: `${env.NEXT_PUBLIC_NEXTAUTH_URL}placement_test/${courseSlug}` })
        setOrderDetailsOpen(true)
    }

    const handleCreateOrder = () => {
        if (!email) return toast({ variant: "destructive", title: "No Email!" })
        if (!leadId) return createOrderWithLeadMutation.mutate({
            courseDetails: {
                courseId,
                isPrivate,
            },
            email,
        })
        createOrderMutation.mutate({
            courseDetails: {
                courseId,
                isPrivate,
            },
            email,
            leadId,
        })
    }

    return (
        <Modal
            title={orderDetailsOpen ? "User Details" : "Create order"}
            description={orderDetailsOpen ? "You can share these details with the student" : "select a course to create an order"}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        >
            {orderDetailsOpen ? (
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
            ) : (
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-4 [&>*]:w-full">
                        <SingleSelectCourses
                            loading={false}
                            courseId={courseId}
                            setCourseId={setCourseId}
                        />
                        <div className="flex items-center space-x-2">
                            <Switch checked={isPrivate} onCheckedChange={(val) => setIsPrivate(val)} id="isPrivate" />
                            <Label htmlFor="isPrivate">Private Class?</Label>
                        </div>
                    </div>
                    <div className="space-x-2 mt-auto flex">
                        <Button disabled={!!loadingToast} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                            setCourseId("")
                        }}>
                            Clear
                        </Button>
                        <Button disabled={!!loadingToast} onClick={handleCreateOrder}>
                            Confirm
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default CreateOrderModal