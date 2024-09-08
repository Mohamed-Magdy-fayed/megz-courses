import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import Modal from "../ui/modal"
import SelectField from "./SelectField"
import { Address, Course, CourseStatus, Order, User } from "@prisma/client"
import { Button } from "../ui/button"
import { api } from "@/lib/api"
import { toastType, useToast } from "../ui/use-toast"
import CoursesSelectField from "./CoursesSelectField"
import Spinner from "@/components/Spinner"
import { render } from "@react-email/render"
import Email from "@/components/emails/Email"
import { sendZohoEmail } from "@/lib/gmailHelpers"

interface CreateOrderProps {
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    usersdata: (User & {
        address: Address | null;
        orders: Order[];
        courseStatus: CourseStatus[];
    })[];
    coursesData: Course[];
    salesOperationId: string;
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
    const [coursesList, setCoursesList] = useState<{
        label: string
        value: string
        active: boolean
    }[]>([])
    const [coursesGroupType, setCoursesGroupType] = useState<{ courseId: string, isPrivate: boolean }[]>([])
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toastError, toast } = useToast()

    const createOrderMutation = api.orders.createOrder.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
            duration: 30000,
        })),
        onSuccess: ({ emailProps, orderNumber }) => {
            const html = render(
                <Email
                    {...emailProps}
                />, { pretty: true }
            )

            sendZohoEmail({ email: emailProps.userEmail, subject: `Thanks for your order ${orderNumber}`, html })
            loadingToast?.update({
                id: loadingToast.id,
                title: "Success",
                description: "Order created successfully",
                variant: "success",
            })
        },
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "success",
        }),
        onSettled: () => {
            trpcUtils.salesOperations.invalidate()
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
            setOpen(false)
        }
    })
    const trpcUtils = api.useContext()

    const handleAddCourse = () => {
        if (!email[0] || !coursesGroupType[0]) return toastError(`missing some info here!`)

        setLoading(true)
        createOrderMutation.mutate({
            courseDetails: coursesGroupType[0],
            email: email[0],
            salesOperationId
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
            title="Add course"
            description="select course to be added to this order"
            isOpen={open}
            onClose={() => setOpen(false)}
        >
            <div className="flex items-center justify-between gap-4">
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
                        <CoursesSelectField
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
                        setEmail([])
                    }}>
                        Clear
                    </Button>
                    <Button disabled={loading} onClick={handleAddCourse}>
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default CreateOrder