import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useState } from "react";
import UserInfoPanel from "@/components/salesOperation/UserInfoPanel";
import OperationStatus from "@/components/salesOperation/OperationStatus";
import OrderInfoPanel from "@/components/salesOperation/OrderInfoPanel";
import CreateOrder from "@/components/salesOperation/CreateOrder";
import { Calendar, CalendarIcon, ExternalLink, Loader, User } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Spinner";
import { cn } from "@/lib/utils";
import { toastType, useToast } from "@/components/ui/use-toast";
import Modal from "@/components/ui/modal";
import SelectField from "@/components/salesOperation/SelectField";
import { DatePicker } from "@/components/ui/DatePicker";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { format } from "date-fns";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import StudentForm from "@/components/studentComponents/StudentForm";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/TimePicker";
import CalenderComp from "@/components/ui/calendar"
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const OperationPage = () => {
    const router = useRouter()
    const code = router.query.operationId as string
    const [open, setOpen] = useState(false)
    const [testTime, setTestTime] = useState<Date | undefined>(new Date())
    const [trainerId, setTrainerId] = useState<string[]>([])
    const [isScheduleTestOpen, setIsScheduleTestOpen] = useState(false)
    const [selectTime, setSelectTime] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toastError, toast } = useToast()
    const [isOpen, setIsOpen] = useState(false);

    const { data: salesOperationData, isLoading, isError } = api.salesOperations.getByCode.useQuery({ code }, { enabled: !!code })
    const { data: coursesData } = api.courses.getAll.useQuery()
    const { data: usersData } = api.users.getUsers.useQuery({ userType: "student" })
    const { data: trainersData } = api.trainers.getAvialableTesters.useQuery({ startTime: testTime! }, { enabled: !!testTime })

    const session = useSession()
    const trpcUtils = api.useUtils()
    const createPlacementTestMeetingMutation = api.zoomMeetings.createPlacementTestMeeting.useMutation()
    const updateSalesOperationMutation = api.salesOperations.editSalesOperations.useMutation()
    const createPlacementTestMutation = api.placementTests.startCourses.useMutation()

    const availableZoomClientMutation = api.zoomAccounts.getAvailableZoomClient.useMutation({
        onMutate: () => {
            setLoading(true)
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 30000,
            }))
        },
        onSuccess: ({ zoomClient }) => {
            if (!zoomClient?.id) {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Error",
                    description: "No available Zoom Accounts at the selected time!",
                    variant: "destructive",
                })
                setLoading(false)
                loadingToast?.dismissAfter()
                setLoadingToast(undefined)
                return
            }
            refreshTokenMutation.mutate({ zoomClientId: zoomClient.id }, {
                onSuccess: ({ updatedZoomClient }) => {
                    if (!salesOperationData?.salesOperations?.orderDetails?.courseId || !trainerId[0] || !testTime) {
                        setLoading(false)
                        return loadingToast?.update({
                            id: loadingToast.id,
                            title: "Error",
                            description: "Missing some information here!",
                            duration: 2000,
                            variant: "destructive",
                        })
                    }

                    createPlacementTestMeetingMutation.mutate({
                        zoomClientId: updatedZoomClient.id,
                        courseId: salesOperationData.salesOperations.orderDetails.courseId,
                        testTime,
                        trainerId: trainerId[0],
                    }, {
                        onSuccess: ({ meetingNumber, meetingPassword, meetingLink }) => {
                            sendWhatsAppMessage({
                                toNumber: `${salesOperationData?.salesOperations?.orderDetails?.user.phone}`,
                                textBody: `Hi ${salesOperationData?.salesOperations?.orderDetails?.user.name},
                                \nyour oral placement test is scheduled at ${format(testTime, "PPPPp")} with Mr. ${trainersData?.trainers.find(trainer => trainer.id === trainerId[0])?.user.name}
                                \nPlease access it on time through this link: ${meetingLink}`,
                            })
                            createPlacementTestMutation.mutate({
                                userId: salesOperationData?.salesOperations?.orderDetails?.userId!,
                                courseId: salesOperationData?.salesOperations?.orderDetails?.courseId!,
                                testTime,
                                trainerId: trainerId[0]!,
                                meetingNumber,
                                meetingPassword,
                            }, {
                                onSuccess: (data) => {
                                    if (!salesOperationData?.salesOperations?.id) return toastError("No Operation ID")
                                    updateSalesOperationMutation.mutate({
                                        id: salesOperationData.salesOperations.id,
                                        status: "completed"
                                    }, {
                                        onSettled: () => {
                                            trpcUtils.salesOperations.invalidate()
                                                .then(() => {
                                                    loadingToast?.update({
                                                        id: loadingToast.id,
                                                        title: "Success",
                                                        description: `Placement test created!`,
                                                        variant: "success",
                                                    })
                                                    setLoading(false)
                                                    setIsScheduleTestOpen(false)
                                                })
                                        }
                                    })
                                },
                                onError: (error) => {
                                    toastError(error.message);
                                    setLoading(false)
                                },
                            })
                        },
                        onError: ({ message }) => {
                            loadingToast?.update({
                                id: loadingToast.id,
                                title: "Error",
                                description: message,
                                variant: "destructive",
                            })
                            setLoading(false)
                        },
                    })
                },
            })
        },
    });
    const refreshTokenMutation = api.zoomMeetings.refreshToken.useMutation();

    const handleSchedulePlacementTest = () => {
        if (!coursesData?.courses.some(course => salesOperationData?.salesOperations?.orderDetails?.courseId === course.id && course.evaluationForms.some(form => form.type === "placementTest"))) return toastError("no placement test created for this course yet!")
        if (!salesOperationData?.salesOperations?.orderDetails || !trainerId[0] || !testTime) return toastError("Missing some information here!")
        setLoading(true)
        availableZoomClientMutation.mutate({ startDate: testTime })
    }

    return (
        <AppLayout>
            <Modal
                description="Select a time for the student test"
                isOpen={isScheduleTestOpen}
                onClose={() => setIsScheduleTestOpen(false)}
                title="Schedule"
            >
                <div className="space-y-4 p-2">
                    <Button
                        variant="outline"
                        customeColor={"foregroundOutlined"}
                        onClick={() => setSelectTime(!selectTime)}
                        className={cn('flex flex-wrap items-center h-fit gap-2 justify-start hover:bg-background hover:text-primary hover:border-primary')}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {testTime ? format(testTime, "PPPp") : <span>Pick a date</span>}
                    </Button>
                    <div className={cn("w-fit space-y-2", selectTime ? "grid" : "hidden")}>
                        <div className="rounded-md border">
                            <CalenderComp mode="single" selected={testTime} onSelect={setTestTime} initialFocus />
                        </div>
                        <Label htmlFor="hours" className="text-xs">
                            Time
                        </Label>
                        <div className="flex gap-2 items-center">
                            <TimePicker
                                date={testTime}
                                setDate={setTestTime}
                            />
                        </div>
                    </div>
                    <SelectField
                        data={
                            trainersData?.trainers
                                ? trainersData.trainers.filter(t => t.role === "tester").map(trainer => ({
                                    active: true,
                                    label: trainer.user.name,
                                    value: trainer.id,
                                }))
                                : []
                        }
                        listTitle="Testers"
                        placeholder="Select Tester"
                        setValues={setTrainerId}
                        values={trainerId}
                    />
                    <div>
                        <Button disabled={!!loadingToast} onClick={() => handleSchedulePlacementTest()}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                        </Button>
                    </div>
                </div>
            </Modal>
            {isLoading ? (
                <div className="w-full grid place-content-center">
                    <Loader className="animate-spin" size={100}></Loader>
                </div>
            ) : isError ? (
                <div className="text-error">Error!</div>
            ) : !salesOperationData.salesOperations ? (
                <div className="text-error">Error!</div>
            ) : (
                <>
                    <OperationStatus data={salesOperationData.salesOperations} />
                    <div className="py-4 space-y-4">
                        <ConceptTitle>User Details</ConceptTitle>
                        <div className="flex gap-4 flex-col md:flex-row">
                            <UserInfoPanel data={salesOperationData.salesOperations} />
                            {!!salesOperationData.salesOperations.lead && (
                                <PaperContainer className=" flex-grow">
                                    <Typography variant={"secondary"}>Lead</Typography>
                                    <div className="flex gap-2 p-4 justify-between">
                                        {salesOperationData.salesOperations.lead.image && (
                                            <Avatar>
                                                <AvatarImage src={salesOperationData.salesOperations.lead.image} />
                                            </Avatar>
                                        )}
                                        <div className="flex flex-col">
                                            {salesOperationData.salesOperations.lead.name && <Typography onDoubleClick={(e) => window.getSelection()?.selectAllChildren(e.target as Node)}>{salesOperationData.salesOperations.lead.name}</Typography>}
                                            {salesOperationData.salesOperations.lead.email && <Typography onDoubleClick={(e) => window.getSelection()?.selectAllChildren(e.target as Node)}>{salesOperationData.salesOperations.lead.email}</Typography>}
                                            {salesOperationData.salesOperations.lead.phone && <Typography onDoubleClick={(e) => window.getSelection()?.selectAllChildren(e.target as Node)}>{salesOperationData.salesOperations.lead.phone}</Typography>}
                                            {salesOperationData.salesOperations.lead.message && <Typography onDoubleClick={(e) => window.getSelection()?.selectAllChildren(e.target as Node)}>{salesOperationData.salesOperations.lead.message}</Typography>}
                                            <Typography className="mt-4">{salesOperationData.salesOperations.lead.source}</Typography>
                                        </div>
                                        {salesOperationData.salesOperations.orderDetails?.user ? (
                                            <div className="flex flex-col gap-4">
                                                <Link href={`/leads/${salesOperationData.salesOperations.lead.id}`}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant={"link"} className="w-full flex items-center justify-between gap-4" >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Go to Lead
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Link>
                                                <Link href={`/account/${salesOperationData.salesOperations.orderDetails.user.id}`}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant={"link"} className="w-full flex items-center justify-between gap-4" >
                                                                <User className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Go to user account
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Link>
                                            </div>
                                        ) : (
                                            <Button onClick={() => setIsOpen(!isOpen)}>Create an account</Button>
                                        )}
                                    </div>
                                    {isOpen && <StudentForm setIsOpen={setIsOpen}></StudentForm>}
                                </PaperContainer>
                            )}
                        </div>
                    </div>
                    <div className="py-4">
                        <ConceptTitle>Order Details</ConceptTitle>
                        <OrderInfoPanel data={salesOperationData.salesOperations} />
                    </div>
                    <div className="flex">
                        {coursesData && usersData && (
                            <CreateOrder
                                salesOperationId={salesOperationData?.salesOperations?.id}
                                coursesData={coursesData.courses}
                                loading={loading}
                                open={open}
                                setLoading={setLoading}
                                setOpen={setOpen}
                                usersdata={usersData.users}
                            />
                        )}
                        {salesOperationData.salesOperations.orderDetails !== null && (
                            <Button
                                disabled={
                                    loading
                                    || salesOperationData.salesOperations.status === "completed"
                                    || salesOperationData.salesOperations.orderDetails.status !== "paid"
                                    || (
                                        session.data?.user.id !== salesOperationData.salesOperations.assignee?.userId
                                        && session.data?.user.userType !== "admin"
                                    )
                                }
                                onClick={() => setIsScheduleTestOpen(true)}
                                className="bg-success hover:bg-success/90"
                            >
                                <Typography className={cn("", loading && "opacity-0")}>Complete</Typography>
                                {loading && <Spinner className="w-4 h-4 absolute" />}
                            </Button>
                        )}
                        <Button
                            disabled={
                                salesOperationData.salesOperations.status !== "ongoing"
                                || salesOperationData.salesOperations.orderDetails !== null
                                || !(session.data?.user.id === salesOperationData.salesOperations.assignee?.userId
                                    || session.data?.user.userType === "admin")
                            }
                            onClick={() => setOpen(true)}
                            className="ml-auto"
                        >
                            <Typography className={cn("", loading && "opacity-0")}>Add Courses</Typography>
                            {loading && <Spinner className="w-4 h-4 absolute" />}
                        </Button>
                    </div>
                </>
            )}
        </AppLayout>
    )
}

export default OperationPage