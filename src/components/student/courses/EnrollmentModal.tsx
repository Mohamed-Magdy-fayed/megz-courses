import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import Modal from '@/components/ui/modal'
import { Typography } from '@/components/ui/Typoghraphy'
import { formatPercentage, formatPrice } from '@/lib/utils'
import { api } from '@/lib/api'
import { Course } from '@prisma/client'
import { EnrollmentForm } from '@/components/student/courses/EnrollmentForm'
import OrderSummary from '@/components/student/courses/OrderSummary'
import { SpinnerButton } from '@/components/ui/button'
import { CheckCircle2Icon } from 'lucide-react'
import { CreditCardIcon } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

type EnrollmentTarget =
    | { type: "course"; name: string; id: string; privatePrice: number; groupPrice: number }
    | { type: "product"; name: string; id: string; price: number; discountedPrice: number };

interface EnrollmentModalProps {
    setOpen: Dispatch<SetStateAction<boolean>>;
    open: boolean;
    target: EnrollmentTarget;
}

const EnrollmentModal = ({
    target,
    open,
    setOpen,
}: EnrollmentModalProps) => {
    const { data: setupData } = api.setup.getCurrentTier.useQuery();

    const [checkedAgreement, setCheckedAgreement] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [submitTrigger, setSubmitTrigger] = useState<"PayNow" | "PayLater">();

    const hasOnlinePayment = useMemo(() => !!setupData?.tier.onlinePayment, [setupData]);

    const summaryData = useMemo(() => {
        let basePrice = 0;
        let discountedPrice = 0;
        if (target.type === "course") {
            basePrice = isPrivate ? target.privatePrice : target.groupPrice;
        } else {
            basePrice = target.price;
            discountedPrice = target.discountedPrice;
        }

        const price = formatPrice(basePrice);
        const discount = basePrice - (discountedPrice ?? basePrice)
        return {
            price,
            discountedPrice: formatPrice(discountedPrice ?? basePrice),
            discountAmount: formatPrice(discount),
            discountPercentage: formatPercentage(discount / basePrice * 100)
        };
    }, [target, isPrivate]);

    return (
        <Modal
            title={
                <Typography variant="secondary">
                    {target.type === "course" ? "Course" : "Product"} Name:{" "}
                    <Typography className="text-primary">{target.name}</Typography>
                </Typography>
            }
            description="Review your order before confirmation"
            isOpen={open}
            onClose={() => setOpen(false)}
        >
            <div className="grid md:grid-cols-2 gap-4">
                {target.type === "course" ? (
                    <EnrollmentForm
                        type={target.type}
                        courseId={target.id}
                        submitTrigger={submitTrigger}
                        setSubmitTrigger={setSubmitTrigger}
                        setIsOpen={setOpen}
                        hasOnlinePayment={hasOnlinePayment}
                        setIsPrivate={setIsPrivate}
                    />
                ) : (
                    <EnrollmentForm
                        type={target.type}
                        productId={target.id}
                        submitTrigger={submitTrigger}
                        setSubmitTrigger={setSubmitTrigger}
                        setIsOpen={setOpen}
                        hasOnlinePayment={hasOnlinePayment}
                    />
                )}
                <div className="space-y-4">
                    <OrderSummary {...summaryData} />
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="checkedAgreement"
                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            checked={checkedAgreement}
                            onClick={() => setCheckedAgreement((prev) => !prev)}
                        />
                        <Label htmlFor="checkedAgreement" className="leading-5 text-balance">
                            By clicking Submit Order you agree to our{" "}
                            <Link className="in-table-link" target="_blank" href="/privacy">
                                Privacy Policy
                            </Link>{" "}
                            and{" "}
                            <Link className="in-table-link" target="_blank" href="/terms">
                                Terms of Use
                            </Link>
                        </Label>
                    </div>
                    <div className="grid gap-4">
                        <SpinnerButton
                            onClick={() => setSubmitTrigger("PayLater")}
                            className="ml-auto"
                            customeColor="foreground"
                            isLoading={!!submitTrigger}
                            disabled={!checkedAgreement}
                            icon={CheckCircle2Icon}
                            text="Pay Later"
                        />
                        <SpinnerButton
                            onClick={() => setSubmitTrigger("PayNow")}
                            className="ml-auto"
                            isLoading={!!submitTrigger}
                            disabled={!checkedAgreement}
                            icon={CreditCardIcon}
                            text="Continue To Payment"
                        />
                    </div>
                </div>
            </div>
        </Modal>

    )
}

export default EnrollmentModal