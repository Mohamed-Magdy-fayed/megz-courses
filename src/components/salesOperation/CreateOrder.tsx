import { Dispatch, FC, SetStateAction, useState } from "react"
import Modal from "../ui/modal"
import SelectField from "./SelectField"
import { Address, Course, Level, Order, User } from "@prisma/client"
import { Button } from "../ui/button"
import { api } from "@/lib/api"
import { render } from "@react-email/render"
import Email from "../email/Email"
import { format } from "date-fns"
import { useToast } from "../ui/use-toast"
import { env } from "@/env.mjs"

interface CreateOrderProps {
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    usersdata: (User & {
        address: Address | null;
        orders: Order[];
    })[];
    coursesData: (Course & {
        levels: Level[];
    })[];
    salesOperationId: string
}

const CreateOrder: FC<CreateOrderProps> = ({
    open,
    setOpen,
    usersdata,
    coursesData,
    loading,
    setLoading,
    salesOperationId,
}) => {
    const [email, setEmail] = useState<string[]>([])
    const [courses, setCourses] = useState<string[]>([])

    const { toast } = useToast()
    const trpcUtils = api.useContext()
    const createOrderMutation = api.orders.createOrder.useMutation()
    const sendEmailMutation = api.comms.sendEmail.useMutation()

    const handleAddCourses = () => {
        if (!email[0] || courses.length === 0) return toast({
            description: `missing some info here!`,
            variant: "destructive"
        })

        setLoading(true)
        createOrderMutation.mutate({
            courses,
            email: email[0],
            salesOperationId
        }, {
            onSuccess: ({ order: { id, amount, orderNumber, user, courses, createdAt }, sessionId }) => {
                const message = render(
                    <Email
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={`$${(amount / 100).toFixed(2)}`}
                        orderNumber={orderNumber}
                        paymentLink={`${env.NEXTAUTH_URL}/payments?sessionId=${sessionId}`}
                        customerName={user.name}
                        courses={courses.map(course => ({ courseName: course.name, coursePrice: `$${(course.price / 100).toFixed(2)}` }))}
                    />, { pretty: true }
                )
                handleSendEmail({
                    orderId: id,
                    email: user.email,
                    subject: `Thanks for your order ${orderNumber}`,
                    message
                })
            },
            onError: (error) => {
                console.log(error);
            },
        })
    }

    const handleSendEmail = ({
        orderId,
        email,
        subject,
        message,
    }: {
        orderId: string,
        email: string,
        subject: string,
        message: string,
    }) => {
        sendEmailMutation.mutate({
            email,
            subject,
            message,
            orderId,
            salesOperationId,
        }, {
            onSuccess: () => {

            },
            onError: (e) => console.log(e),
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                setOpen(false)
                setLoading(false)
            }
        })
    }

    return (
        <Modal
            title="Add courses"
            description="select courses to be added to this order"
            isOpen={open}
            onClose={() => setOpen(false)}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-4 [&>*]:w-full">
                    {!usersdata ? (<></>) : (
                        <SelectField
                            values={email}
                            setValues={setEmail}
                            placeholder="Select User..."
                            listTitle="Users"
                            data={usersdata.map(item => ({ label: item.email, value: item.email }))} />
                    )}
                    {!coursesData ? (<></>) : (
                        <SelectField
                            multiSelect
                            values={courses}
                            setValues={setCourses}
                            placeholder="Select Course..."
                            listTitle="Courses"
                            data={coursesData.map(item => ({ label: item.name, value: item.id }))} />
                    )}
                </div>
                <div className="space-x-2 mt-auto">
                    <Button disabled={loading} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                        setCourses([])
                        setEmail([])
                    }}>
                        Clear
                    </Button>
                    <Button disabled={loading} onClick={handleAddCourses}>
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default CreateOrder