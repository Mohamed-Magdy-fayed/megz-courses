import ProductSelectField from "@/components/general/selectFields/ProductSelectField";
import { Button, SpinnerButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import MobileNumberInput from "@/components/ui/phone-number-input";
import { Switch } from "@/components/ui/switch";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { CopyIcon, PlusSquareIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";

type ExistingStudent = {
    studentName: string;
    studentId: string;
    leadId?: string;
}

type CreateOrderModalProps = {
    userExists?: ExistingStudent;
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const OrderInputSchema = z.object({
    studentId: z.string(),
    leadId: z.string(),
    productId: z.string(),
    isPrivate: z.boolean(),
});
export type OrderInput = z.infer<typeof OrderInputSchema>

export default function CreateOrderModal({ userExists, isOpen, setIsOpen }: CreateOrderModalProps) {
    const [isPrivate, setIsPrivate] = useState(false)
    const [courseId, setCourseId] = useState<string>()
    const [productId, setProductId] = useState<string>()
    const [studentName, setStudentName] = useState("")
    const [studentEmail, setStudentEmail] = useState("")
    const [studentPhone, setStudentPhone] = useState("")
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast, toastError } = useToast()
    const trpcUtils = api.useUtils()
    const createOrderMutation = api.orders.createOrder.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.orders,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ order, password }) => {
                toast({
                    variant: "info",
                    title: "Student sign in",
                    description: `${studentEmail}\n${password}`,
                    action: <Button onClick={() => navigator.clipboard.writeText(`${studentEmail}\n${password}`)} variant="icon" customeColor="info" children={<CopyIcon size={20} />} />,
                    duration: 30000,
                })
                setIsOpen(false)
                return `Order ${order.orderNumber} created successfully, and user email and password copied to clipboard.`
            }
        })
    )

    function onCreateOrder() {
        if (!productId) return toastError("Please select a product!")
        if (userExists) {
            return createOrderMutation.mutate({
                productId,
                isPrivate,
                studentId: userExists.studentId,
            })
        }
        if (!studentName || !studentEmail || !studentPhone) return toastError("Please add all the student details!")

        createOrderMutation.mutate({
            productId,
            isPrivate,
            studentData: {
                studentName,
                studentEmail,
                studentPhone,
            },
        })
    }

    if (userExists) return (
        <Modal
            title="Create Order"
            description={`Create order for ${userExists.studentName}`}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={
                <div className="space-y-4">
                    <ProductSelectField loading={!!loadingToast} productId={productId} setProductId={setProductId} />
                    <div className="flex items-center justify-end gap-4">
                        <SpinnerButton icon={PlusSquareIcon} text="Place Order" isLoading={!!loadingToast} onClick={onCreateOrder} />
                    </div>
                </div>
            }
        />
    )

    return (
        <Modal
            title="Create quick order"
            description={`Create a quick order for a new student`}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={
                <div className="space-y-4">
                    <Input disabled={!!loadingToast} name="name" type="text" value={studentName} placeholder="Jon Doe" onChange={(e => setStudentName(e.target.value))} />
                    <Input disabled={!!loadingToast} name="email" type="text" value={studentEmail} placeholder="Example@mail.com" onChange={(e => setStudentEmail(e.target.value))} />
                    <MobileNumberInput
                        value={studentPhone}
                        setValue={(val) => setStudentPhone(val)}
                        placeholder="201X XXXXXXXX"
                    />
                    <ProductSelectField loading={!!loadingToast} productId={productId} setProductId={setProductId} />
                    <div className="flex items-center space-x-2">
                        <Switch checked={isPrivate} onCheckedChange={(val) => setIsPrivate(val)} id="isPrivate" />
                        <Label htmlFor="isPrivate">Private Class?</Label>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <SpinnerButton icon={PlusSquareIcon} text="Place Order" isLoading={!!loadingToast} onClick={onCreateOrder} />
                    </div>
                </div>
            }
        />
    )
}
