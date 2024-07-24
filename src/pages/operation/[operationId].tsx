import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useState } from "react";
import UserInfoPanel from "@/components/salesOperation/UserInfoPanel";
import OperationStatus from "@/components/salesOperation/OperationStatus";
import OrderInfoPanel from "@/components/salesOperation/OrderInfoPanel";
import CreateOrder from "@/components/salesOperation/CreateOrder";
import { Calendar, Loader } from "lucide-react";
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

const OperationPage = () => {
    const router = useRouter()
    const code = router.query.operationId as string
    const { data: salesOperationData, isLoading, isError } = api.salesOperations.getByCode.useQuery({ code })
    const { data: coursesData } = api.courses.getAll.useQuery()
    const { data: usersData } = api.users.getUsers.useQuery({ userType: "student" })
    const { data: trainersData } = api.trainers.getTrainers.useQuery()

    const [open, setOpen] = useState(false)
    const [testTime, setTestTime] = useState<Date | undefined>(new Date())
    const [trainerId, setTrainerId] = useState<string[]>([])
    const [isScheduleTestOpen, setIsScheduleTestOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toastSuccess, toastError, toast } = useToast()

    const session = useSession()
    const trpcUtils = api.useContext()
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
                    duration: 2000,
                    variant: "destructive",
                })
                setLoading(false)
                return
            }
            refreshTokenMutation.mutate({ zoomClientId: zoomClient.id }, {
                onSuccess: ({ updatedZoomClient }) => {
                    if (!salesOperationData?.salesOperations?.orderDetails?.courseIds[0] || !trainerId[0] || !testTime) {
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
                        courseId: salesOperationData.salesOperations.orderDetails.courseIds[0],
                        testTime,
                        trainerId: trainerId[0],
                    }, {
                        onSuccess: ({ meetingNumber, meetingPassword, meetingLink }) => {
                            sendWhatsAppMessage({
                                toNumber: "201123862218",
                                textBody: `Hi ${salesOperationData?.salesOperations?.orderDetails?.user.name},
                                \nyour oral placement test is scheduled at ${format(testTime, "PPPPp")} with Mr. ${trainersData?.trainers.find(trainer => trainer.id === trainerId[0])?.user.name}
                                \nPlease access it on time through this link: ${meetingLink}`,
                            })
                            createPlacementTestMutation.mutate({
                                userId: salesOperationData?.salesOperations?.orderDetails?.userId!,
                                courseIds: salesOperationData?.salesOperations?.orderDetails?.courseIds!,
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
                                                        description: `${data?.placementTests.length} Placement tests created!`,
                                                        duration: 2000,
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
                                duration: 2000,
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
        setLoading(true)
        if (!salesOperationData?.salesOperations?.orderDetails || !trainerId[0] || !testTime) return toastError("Missing some information here!")
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
                <div className="space-y-4">
                    <SelectField
                        data={
                            trainersData?.trainers
                                ? trainersData.trainers.map(trainer => ({
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
                    <DatePicker
                        date={testTime}
                        setDate={setTestTime}
                    />
                    <div>
                        <Button onClick={() => handleSchedulePlacementTest()}>
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
                    <div className="py-4">
                        <ConceptTitle>User Details</ConceptTitle>
                        <UserInfoPanel data={salesOperationData.salesOperations} />
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