import React, { Dispatch, FC, SetStateAction, useState } from 'react'
import Modal from '../ui/modal'
import { Typography } from '../ui/Typoghraphy'
import { cn, formatPrice } from '@/lib/utils'
import { Separator } from '../ui/separator'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { CreditCard } from 'lucide-react'
import Spinner from '../Spinner'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { Course } from '@prisma/client'
import ChatWithUs from '../landingPageComponents/ChatWithUs'
import { useRouter } from 'next/router'
import { useToast } from '../ui/use-toast'
import LoginModal from '../modals/LoginModal'
import { render } from '@react-email/render'
import Email from '@/components/emails/Email'

interface EnrollmentModalProps {
    setOpen: Dispatch<SetStateAction<boolean>>
    setLoading: Dispatch<SetStateAction<boolean>>
    open: boolean
    loading: boolean
    course: Course
}

const EnrollmentModal: FC<EnrollmentModalProps> = ({
    course,
    loading,
    open,
    setLoading,
    setOpen,
}) => {
    const sendEmailMutation = api.emails.sendZohoEmail.useMutation()
    const enrollCourseMutation = api.selfServe.enrollCourse.useMutation()
    const { toastError } = useToast()
    const router = useRouter()
    const session = useSession()
    const [loginModalOpen, setLoginModalOpen] = useState(false)
    const [checkedAgreement, setcheckedAgreement] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)

    const onEnroll = () => {
        if (!session.data?.user.email || !session.data?.user.name) return setLoginModalOpen(true)

        setLoading(true)
        enrollCourseMutation.mutate({
            courseId: course.id,
            customerName: session.data.user.name,
            email: session.data.user.email,
            isPrivate,
        }, {
            onSuccess: (data) => {
                const html = render(
                    <Email
                        {...data.emailProps}
                    />, { pretty: true }
                )

                sendEmailMutation.mutate({
                    email: data.emailProps.userEmail,
                    subject: `Thanks for your order ${data.emailProps.orderNumber}`,
                    html,
                })

                router.push(data.paymentLink)
            },
            onError: (e) => toastError(e.message),
            onSettled: () => {
                setLoading(false)
                setOpen(false)
            },
        })
    }

    return (
        <>
            <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
            <Modal
                title="Confirm enrollment"
                description="review your order before confirmation"
                isOpen={open}
                onClose={() => setOpen(false)}
            >
                <div>
                    <div className="flex flex-col items-center justify-between p-4">
                        <div className="self-start">
                            <Typography variant={"secondary"}>{course.name}</Typography>
                        </div>
                        <div className="self-end">
                            <Typography className={cn("", isPrivate && "text-info")}> {formatPrice(isPrivate ? course.privatePrice : course.groupPrice)}</Typography>                    </div>
                        <div className="self-start">
                            <Typography variant={"secondary"}>Do you need a private class?</Typography>
                        </div>
                        <div className="w-full">
                            <Typography>note that prices might change!</Typography>
                            <Checkbox
                                id='isPrivate'
                                className="float-right border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                checked={isPrivate}
                                onClick={() => setIsPrivate((prev) => !prev)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-between p-4">
                        <div className="self-start">
                            <Typography variant={"secondary"}>Creating order for email:</Typography>
                        </div>
                        <div className="self-end">
                            <Typography >{session.data?.user.email}</Typography>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="checkedAgreement"
                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            checked={checkedAgreement}
                            onClick={() => setcheckedAgreement((prev) => !prev)}
                        />
                        <Label htmlFor="checkedAgreement">
                            <Typography className="leading-5">
                                By clicking continue payment online you authorize our website to send you an email with the payment link
                            </Typography>
                        </Label>
                    </div>
                    <div className="flex flex-col items-center justify-between p-4">
                        <Button
                            disabled={!checkedAgreement || loading}
                            onClick={onEnroll}
                        >
                            <Typography className={cn("", loading && "opacity-0")}>
                                Continue payment online
                            </Typography>
                            <CreditCard className={cn("", loading && "opacity-0")} />
                            {loading && <Spinner className="w-4 h-4 absolute" />}
                        </Button>
                        <Separator className='my-4' />
                        <ChatWithUs />
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default EnrollmentModal