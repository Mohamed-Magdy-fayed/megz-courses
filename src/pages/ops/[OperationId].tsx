import { SeverityPill } from "@/components/overview/SeverityPill";
import SelectField from "@/components/salesOperation/SelectField";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import { api } from "@/lib/api";
import { getInitials } from "@/lib/getInitials";
import { cn, formatPrice } from "@/lib/utils";
import { useToastStore } from "@/zustand/store";
import { Avatar, CircularProgress, Typography } from "@mui/material";
import { Course, Order, SalesAgent, SalesOperation, User } from "@prisma/client";
import { render } from "@react-email/render";
import { format } from "date-fns";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Email from "@/components/email/Email";

const OperationPage: NextPage = () => {
    const id = useRouter().query.OperationId as string
    const { data, isLoading, isError } = api.salesOperations.getById.useQuery({ id })
    const { data: coursesData, isLoading: isLoadingCourses, isError: isErrorCourses } = api.courses.getAll.useQuery()
    const { data: usersData, isLoading: isLoadingUsers, isError: isErrorUsers } = api.users.getUsers.useQuery({ userType: "student" })

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState<string[]>([])
    const [courses, setCourses] = useState<string[]>([])

    const toast = useToastStore()
    const createOrderMutation = api.orders.createOrder.useMutation()
    const handleAddCourses = () => {
        if (!email[0] || courses.length === 0) return toast.error(`missing some info here!`)

        setLoading(true)
        createOrderMutation.mutate({
            courses,
            email: email[0],
            salesOperationId: id
        }, {
            onSuccess: ({ order: { id, amount, orderNumber, user, courses, createdAt } }) => {
                const message = render(
                    <Email
                        orderCreatedAt={format(createdAt, "dd MMM yyyy")}
                        userEmail={user.email}
                        orderAmount={`$${(amount / 100).toFixed(2)}`}
                        orderNumber={orderNumber}
                        paymentLink="http://localhost:3000"
                        customerName={user.name}
                        courses={courses.map(course => ({ courseName: course.name, coursePrice: `$${(course.price / 100).toFixed(2)}` }))}
                    />, { pretty: true }
                )
                handleSendEmail(id, user.email, `Thanks for your order ${orderNumber}`, message)
            },
            onError: (error) => {
                console.log(error);
            },
        })
    }

    const trpcUtils = api.useContext()
    const updateSalesOperationMutation = api.salesOperations.editSalesOperations.useMutation()
    const sendEmailMutation = api.comms.sendEmail.useMutation()
    const handleSendEmail = (
        orderId: string,
        email: string,
        subject: string,
        message: string,
    ) => {
        sendEmailMutation.mutate({
            email,
            subject,
            message,
            orderId,
        }, {
            onSuccess: (data) => {
                updateSalesOperationMutation.mutate({
                    id,
                    amount: data?.amount,
                    email: data?.user.email,
                }, {
                    onSettled: () => {
                        trpcUtils.salesOperations.invalidate()
                        setOpen(false)
                        setLoading(false)
                    }
                })
            },
            onError: (e) => console.log(e),
        })
    }

    const handleCompleteOperation = () => {
        setLoading(true)
        updateSalesOperationMutation.mutate({
            id,
            status: "completed"
        }, {
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                setLoading(false)
            }
        })
    }

    return (
        <AppLayout>
            {isLoading ? (
                <div className="w-full grid place-content-center">
                    <CircularProgress size={100}></CircularProgress>
                </div>
            ) : isError ? (
                <div className="text-error">Error!</div>
            ) : !data.salesOperations ? (
                <div className="text-error">Error!</div>
            ) : (
                <>
                    <OperationStatus data={data.salesOperations} />
                    <div className="py-4">
                        <ConceptTitle>User Details</ConceptTitle>
                        {<UserInfoPanel data={data.salesOperations} />}
                    </div>
                    <div className="py-4">
                        <ConceptTitle>Order Details</ConceptTitle>
                        {<OrderInfoPanel data={data.salesOperations} />}
                    </div>
                    <div className="flex">
                        <Modal
                            title="Add courses"
                            description="select courses to be added to this order"
                            isOpen={open}
                            onClose={() => setOpen(false)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-4 [&>*]:w-full">
                                    {!usersData?.users ? (<></>) : (
                                        <SelectField
                                            values={email}
                                            setValues={setEmail}
                                            placeholder="Select User..."
                                            listTitle="Users"
                                            data={usersData.users.map(item => ({ label: item.email, value: item.email }))} />
                                    )}
                                    {!coursesData?.courses ? (<></>) : (
                                        <SelectField
                                            multiSelect
                                            values={courses}
                                            setValues={setCourses}
                                            placeholder="Select Course..."
                                            listTitle="Courses"
                                            data={coursesData.courses.map(item => ({ label: item.name, value: item.id }))} />
                                    )}
                                </div>
                                <div className="space-x-2 mt-auto">
                                    <Button disabled={loading} variant={"destructive"} onClick={() => {
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
                        {data.salesOperations.orderDetails !== null && (
                            <Button
                                disabled={loading || data.salesOperations.status === "completed"}
                                onClick={handleCompleteOperation}
                                className="bg-success hover:bg-success/90"
                            >
                                Complete
                            </Button>
                        )}
                        <Button
                            disabled={data.salesOperations.status !== "ongoing" || data.salesOperations.orderDetails !== null}
                            onClick={() => setOpen(true)}
                            className="ml-auto"
                        >Add Courses</Button>
                    </div>
                </>
            )}
        </AppLayout>
    )
}

const OperationStatus = ({ data }: {
    data: (SalesOperation & {
        assignee: SalesAgent & {
            user: User
        } | null;
    })
}) => {
    const statusMap: {
        created: "primary";
        assigned: "warning";
        ongoing: "info";
        completed: "success";
        cancelled: "error";
    } = {
        created: "primary",
        assigned: "warning",
        ongoing: "info",
        completed: "success",
        cancelled: "error"
    };

    const [isLoading, setIsLoading] = useState(false)
    const toast = useToastStore()

    const updatedAt = format(data.updatedAt, "dd-MMMM-yy");
    const orderStatus = data.status as keyof typeof statusMap;

    const editMutation = api.salesOperations.editSalesOperations.useMutation()
    const trpcUtils = api.useContext()

    const handleStatusChange = (status: "created" | "assigned" | "ongoing" | "completed" | "cancelled") => {
        setIsLoading(true)
        editMutation.mutate({ id: data.id, status }, {
            onSuccess: (data) => {
                console.log(data);
                toast.success(`Operation ${data.updatedSalesOperations.code} is now ${data.updatedSalesOperations.status}!`)
            },
            onError: (error) => {
                console.log(error);
                toast.error(`unable to change operation status!`)
            },
            onSettled: () => {
                trpcUtils.salesOperations.invalidate()
                setIsLoading(false)
            }
        })
    }

    return (
        <div className="space-y-4">
            <ConceptTitle>Operation Code: {data.code}</ConceptTitle>
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <SeverityPill
                        color={statusMap[orderStatus]}
                        label={orderStatus}
                    />
                    <Typography>Latest update: {updatedAt}</Typography>
                </div>
                {data.status === "assigned" ? (
                    <Button disabled={isLoading} onClick={() => handleStatusChange("ongoing")} className={cn("self-end", isLoading && "text-gray-500 border-gray-500 pointer-events-none")} variant={"outline"}>
                        {isLoading ? <CircularProgress /> : "Start"}
                    </Button>
                ) : data.status === "ongoing" ? (
                    <Button disabled={isLoading} onClick={() => handleStatusChange("cancelled")} className={cn("self-end border-error text-error hover:bg-error", isLoading && "text-gray-500 border-gray-500 pointer-events-none")} variant={"outline"}>
                        {isLoading ? <CircularProgress size={25} color="inherit" /> : "Cancel"}
                    </Button>
                ) : (
                    <Tooltip>
                        <Link className="group hidden sm:flex items-center gap-4" href={`/account/${data.assignee?.user.id}`}>
                            <Typography className="group-hover:text-primary">
                                {data.assignee?.user.email}
                            </Typography>
                            <Avatar src={data.assignee?.user.image as string}>
                                {getInitials(data.assignee?.user.name)}
                            </Avatar>
                        </Link>
                        <TooltipTrigger className="sm:hidden">
                            <Link href={`/account/${data.assignee?.user.id}`}>
                                <Avatar src={data.assignee?.user.image as string}>
                                    {getInitials(data.assignee?.user.name)}
                                </Avatar>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            {data.assignee?.user.email}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

const UserInfoPanel = ({ data }: {
    data: SalesOperation & {
        assignee: (SalesAgent & {
            user: User;
        }) | null;
        orderDetails: (Order & {
            user: User;
        }) | null;
    }
}) => {
    return (
        <PaperContainer className="mt-4 p-4">
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex gap-4 items-center">
                    <Avatar>{getInitials(data.orderDetails?.user.name) || "NA"}</Avatar>
                    <Typography>{data.orderDetails?.user.name || "NA"}</Typography>
                </div>
                <div className="flex gap-4 items-center">
                    <Typography>Email: {data.orderDetails?.user.email || "NA"}</Typography>
                    <Typography>Phone: {data.orderDetails?.user.phone || "NA"}</Typography>
                </div>
            </div>
        </PaperContainer>
    )
}

const OrderInfoPanel = ({ data }: {
    data: SalesOperation & {
        assignee: (SalesAgent & {
            user: User;
        }) | null;
        orderDetails: (Order & {
            user: User;
            courses: Course[];
        }) | null;
    }
}) => {
    return (
        <PaperContainer className="mt-4 p-4">
            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div>
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold my-4">Order Number: </Typography>
                        <Typography>{data.orderDetails?.orderNumber || "NA"}</Typography>
                    </div>
                    <Typography>Status: {data.orderDetails?.status || "NA"}</Typography>
                    <Typography>Total: {formatPrice(data.orderDetails?.amount || 0)}</Typography>
                </div>
                <div>
                    <div className="flex items-center gap-4">
                        <Typography className="font-bold my-4">Courses</Typography>
                        <Typography>{data.orderDetails?.courses.length || "NA"}</Typography>
                    </div>
                    {data.orderDetails?.courses.map(course => (
                        <>
                            <Typography>Title: {course.name || "NA"}</Typography>
                            <Typography>Price: {formatPrice(course.price || 0)}</Typography>
                        </>
                    ))}
                </div>
            </div>
        </PaperContainer>
    )
}

export default OperationPage