import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { Course } from "@prisma/client"
import { Button } from "../ui/button"
import { api } from "@/lib/api"
import { render } from "@react-email/render"
import Email from "../emails/Email"
import { format } from "date-fns"
import { useToast } from "../ui/use-toast"
import { formatPrice } from "@/lib/utils"
import CoursesSelectField from "../salesOperation/CoursesSelectField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Typography } from "../ui/Typoghraphy"
import Modal from "@/components/ui/modal"
import { Users } from "@/components/studentComponents/StudentClient"

interface CreateOrderForStudentProps {
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    userData: Users;
    coursesData: Course[];
}

const CreateOrderForStudent: FC<CreateOrderForStudentProps> = ({
    open,
    setOpen,
    userData,
    coursesData,
    loading,
    setLoading,
}) => {
    const [assigneeId, setAssigneeId] = useState("");
    const [coursesList, setCoursesList] = useState<{
        label: string
        value: string
        active: boolean
    }[]>([])
    const [coursesGroupType, setCoursesGroupType] = useState<{ courseId: string, isPrivate: boolean }[]>([])

    const { toastError, toastSuccess } = useToast()

    const { data: siteData } = api.siteIdentity.getSiteIdentity.useQuery()
    const { data: salesAgentsData } = api.users.getUsers.useQuery({ userType: "salesAgent" })
    const createSalesOperationMutation = api.salesOperations.createSalesOperation.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ salesOperations }) => {
            createOrderMutation.mutate({
                courseDetails: coursesGroupType[0]!,
                email: userData.email,
                salesOperationId: salesOperations.id
            })
        },
        onError: ({ message }) => toastError(message),
        onSettled: () => { },
    })
    const createOrderMutation = api.orders.createOrder.useMutation({
        onSuccess: ({ order: { id, amount, orderNumber, user, course, createdAt, courseType, salesOperationId }, paymentLink }) => {
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
    const sendEmailMutation = api.emails.sendEmail.useMutation()
    const trpcUtils = api.useContext()

    const handleAddCourses = () => {
        if (!coursesGroupType[0]) return toastError(`missing some info here!`)

        createSalesOperationMutation.mutate({ status: "ongoing", assigneeId: assigneeId })
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
            message,
        }, {
            onError: (e) => toastError(e.message),
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                    .then(() => {
                        setOpen(false)
                        setLoading(false)
                    })
            }
        })
    }

    useEffect(() => {
        if (!userData) return
        const newList = coursesData.map(item => ({
            label: item.name,
            value: item.id,
            active: !userData.courseStatus.some(status => status.courseId === item.id)
        }))
        setCoursesList(newList)
    }, [userData])

    return (
        <Modal
            title="Add courses"
            description="select courses to be added to this order"
            isOpen={open}
            onClose={() => setOpen(false)}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-4 [&>*]:w-full">
                    <Typography>{userData.email}</Typography>
                    <Select
                        disabled={loading}
                        // @ts-ignore
                        onValueChange={(e) => setAssigneeId(e)}
                    >
                        <SelectTrigger className="pl-8">
                            <SelectValue
                                placeholder="Select assignee"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {salesAgentsData?.users.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!coursesData ? (<></>) : (
                        <CoursesSelectField
                            multiSelect
                            loading={loading}
                            values={coursesGroupType}
                            setValues={setCoursesGroupType}
                            placeholder="Select Course..."
                            listTitle="Courses"
                            data={coursesList} />
                    )}
                </div>
                <div className="space-x-2 mt-auto flex">
                    <Button disabled={loading} variant={"outline"} customeColor={"destructiveOutlined"} onClick={() => {
                        setCoursesGroupType([])
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

export default CreateOrderForStudent