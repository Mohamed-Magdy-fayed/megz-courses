import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import Modal from "../ui/modal"
import SelectField from "./SelectField"
import { Address, Course, Level, Order, User } from "@prisma/client"
import { Button } from "../ui/button"
import { api } from "@/lib/api"
import { render } from "@react-email/render"
import Email from "../emails/Email"
import { format } from "date-fns"
import { useToast } from "../ui/use-toast"
import { formatPrice } from "@/lib/utils"

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
    const [coursesList, setCoursesList] = useState<{
        label: string
        value: string
        active: boolean
    }[]>([])

    const { toastError, toastSuccess } = useToast()
    const trpcUtils = api.useContext()
    const createOrderMutation = api.orders.createOrder.useMutation()
    const sendEmailMutation = api.comms.sendEmail.useMutation()

    const handleAddCourses = () => {
        if (!email[0] || courses.length === 0) return toastError(`missing some info here!`)

        setLoading(true)
        createOrderMutation.mutate({
            courses,
            email: email[0],
            salesOperationId
        }, {
            onSuccess: ({ order: { id, amount, orderNumber, user, courses, createdAt }, paymentLink }) => {
                const message = render(
                    <Email
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={formatPrice(amount)}
                        orderNumber={orderNumber}
                        paymentLink={paymentLink}
                        customerName={user.name}
                        courses={courses.map(course => ({ courseName: course.name, coursePrice: formatPrice(course.price) }))}
                    />, { pretty: true }
                )
                handleSendEmail({
                    orderId: id,
                    email: user.email,
                    subject: `Thanks for your order ${orderNumber}`,
                    message
                })
                toastSuccess(`Order ${orderNumber} has been submitted successfully!`)
            },
            onError: (error) => {
                toastError(error.message)
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
            alreadyUpdated: false
        }, {
            onError: (e) => toastError(e.message),
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                setOpen(false)
                setLoading(false)
            }
        })
    }

    useEffect(() => {
        const user = usersdata.filter(user => user.email === email[0])[0]
        if (!user) return
        const newList = coursesData.map(item => ({
            label: item.name,
            value: item.id,
            active: !user.courseStatus.some(status => status.courseId === item.id)
        }))
        setCoursesList(newList)
    }, [email])

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
                            data={usersdata.map(item => ({ label: item.email, value: item.email, active: true }))} />
                    )}
                    {!coursesData || !email[0] ? (<></>) : (
                        <SelectField
                            multiSelect
                            values={courses}
                            setValues={setCourses}
                            placeholder="Select Course..."
                            listTitle="Courses"
                            data={coursesList} />
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