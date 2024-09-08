import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { Course, CourseStatus, User } from "@prisma/client"
import { Button } from "../ui/button"
import { api } from "@/lib/api"
import { useToast } from "../ui/use-toast"
import CoursesSelectField from "../salesOperation/CoursesSelectField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Typography } from "../ui/Typoghraphy"
import Modal from "@/components/ui/modal"
import { render } from "@react-email/render"
import Email from "@/components/emails/Email"
import { sendZohoEmail } from "@/lib/gmailHelpers"

interface CreateOrderForStudentProps {
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    userData: User & { courseStatus: CourseStatus[] };
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

    const { data: siteData, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })

    useEffect(() => { refetch() }, [])
    const { data: salesAgentsData } = api.users.getUsers.useQuery({ userType: "salesAgent" })
    const sendEmailMutation = api.emails.sendZohoEmail.useMutation()
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
        onSuccess: ({ emailProps, orderNumber }) => {
            const html = render(
                <Email
                    {...emailProps}
                />, { pretty: true }
            )

            sendEmailMutation.mutate({ email: emailProps.userEmail, subject: `Thanks for your order ${orderNumber}`, html })
            toastSuccess(`Order ${orderNumber} has been submitted successfully!`)
        },
        onError: (error) => {
            toastError(error.message)
        },
    })

    const handleAddCourses = () => {
        if (!coursesGroupType[0]) return toastError(`missing some info here!`)

        createSalesOperationMutation.mutate({ status: "ongoing", assigneeId: assigneeId })
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