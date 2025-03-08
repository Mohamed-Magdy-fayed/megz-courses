import CourseSelectField from "@/components/selectFields/CourseSelectField";
import ProductSelectField from "@/components/selectFields/ProductSelectField";
import { Button, SpinnerButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import MobileNumberInput from "@/components/ui/phone-number-input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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

const CourseOrderSchema = z.object({
    courseId: z.string(),
    isPrivate: z.boolean(),
    productId: z.never(),
});

const ProductOrderSchema = z.object({
    productId: z.string(),
    courseId: z.never(),
    isPrivate: z.never(),
});

export const OrderInputSchema = z.object({
    studentId: z.string(),
    leadId: z.string(),
}).and(z.union([CourseOrderSchema, ProductOrderSchema]));
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
    const createCourseQuickOrderMutation = api.orders.createCourseQuickOrder.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.orders,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ order, password }) => {
                navigator.clipboard.writeText(`${studentEmail}\n${password}`)
                toast({
                    variant: "info",
                    title: "Student sign in",
                    description: `${studentEmail}\n${password}`,
                    action: <Button variant="icon" customeColor="info" children={<CopyIcon size={20} />} />,
                    duration: 30000,
                })
                setIsOpen(false)
                return `Order ${order.orderNumber} created successfully, and user email and password copied to clipboard.`
            }
        })
    )
    const createProductQuickOrderMutation = api.orders.createProductQuickOrder.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.orders,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ order, password }) => {
                navigator.clipboard.writeText(`${studentEmail}\n${password}`)
                toast({
                    variant: "info",
                    title: "Student sign in",
                    description: `${studentEmail}\n${password}`,
                    action: <Button variant="icon" customeColor="info" children={<CopyIcon size={20} />} />,
                    duration: 30000,
                })
                setIsOpen(false)
                return `Order ${order.orderNumber} created successfully, and user email and password copied to clipboard.`
            }
        })
    )
    const createProductOrderMutation = api.orders.createProductOrder.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.orders,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ order }) => { setIsOpen(false); return `Order ${order.orderNumber} created successfully.` }
        })
    )
    const createCourseOrderMutation = api.orders.createCourseOrder.useMutation(
        createMutationOptions({
            trpcUtils: trpcUtils.orders,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ order }) => { setIsOpen(false); return `Order ${order.orderNumber} created successfully.` }
        })
    )

    function onCreateProductOrder() {
        if (!productId) return toastError("Please select a product!")
        if (userExists) {
            return createProductOrderMutation.mutate({
                productId,
                studentId: userExists.studentId,
            })
        }
        if (!studentName || !studentEmail || !studentPhone) return toastError("Please add all the student details!")

        createProductQuickOrderMutation.mutate({
            productId,
            studentName,
            studentEmail,
            studentPhone,
        })
    }

    function onCreateCourseOrder() {
        if (!courseId) return toastError("Please select a course!")
        if (userExists) {
            return createCourseOrderMutation.mutate({
                courseId,
                isPrivate,
                studentId: userExists.studentId,
            })
        }
        if (!studentName || !studentEmail || !studentPhone) return toastError("Please add all the student details!")
        createCourseQuickOrderMutation.mutate({
            courseId,
            isPrivate,
            studentName,
            studentEmail,
            studentPhone,
        })
    }

    if (userExists) return (
        <Modal
            title="Create Order"
            description={`Create order for ${userExists.studentName}`}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            children={
                <Tabs id="CreateOrder" defaultValue="product">
                    <TabsList className="w-full">
                        <TabsTrigger value="course">Single Course</TabsTrigger>
                        <TabsTrigger value="product">Product</TabsTrigger>
                    </TabsList>
                    <TabsContent value="product">
                        <div className="space-y-4">
                            <ProductSelectField loading={!!loadingToast} productId={productId} setProductId={setProductId} />
                            <div className="flex items-center justify-end gap-4">
                                <SpinnerButton icon={PlusSquareIcon} text="Place Order" isLoading={!!loadingToast} onClick={onCreateProductOrder} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="course">
                        <div className="space-y-4">
                            <CourseSelectField loading={!!loadingToast} courseId={courseId} setCourseId={setCourseId} />
                            <div className="flex items-center space-x-2">
                                <Switch checked={isPrivate} onCheckedChange={(val) => setIsPrivate(val)} id="isPrivate" />
                                <Label htmlFor="isPrivate">Private Class?</Label>
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                <SpinnerButton icon={PlusSquareIcon} text="Place Order" isLoading={!!loadingToast} onClick={onCreateCourseOrder} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
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
                <Tabs id="CreateOrder" defaultValue="product">
                    <TabsList className="w-full">
                        <TabsTrigger value="course">Single Course</TabsTrigger>
                        <TabsTrigger value="product">Product</TabsTrigger>
                    </TabsList>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between w-full gap-4">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" className="max-w-xs" placeholder="Student Name" type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between w-full gap-4">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" className="max-w-xs" placeholder="Student Email" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between w-full gap-4">
                            <Label htmlFor="phone">Phone</Label>
                            <MobileNumberInput inputProps={{ id: "phone", className: "max-w-xs" }} placeholder="Student Phone" value={studentPhone || ""} setValue={(val) => setStudentPhone(val)} />
                        </div>
                    </div>
                    <TabsContent value="product">
                        <div className="space-y-4">
                            <ProductSelectField loading={!!loadingToast} productId={productId} setProductId={setProductId} />
                            <div className="flex items-center justify-end gap-4">
                                <SpinnerButton icon={PlusSquareIcon} text="Place Order" isLoading={!!loadingToast} onClick={onCreateProductOrder} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="course">
                        <div className="space-y-4">
                            <CourseSelectField loading={!!loadingToast} courseId={courseId} setCourseId={setCourseId} />
                            <div className="flex items-center space-x-2">
                                <Switch checked={isPrivate} onCheckedChange={(val) => setIsPrivate(val)} id="isPrivate" />
                                <Label htmlFor="isPrivate">Private Class?</Label>
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                <SpinnerButton icon={PlusSquareIcon} text="Place Order" isLoading={!!loadingToast} onClick={onCreateCourseOrder} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            }
        />
    )
}
