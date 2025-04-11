import { Dispatch, SetStateAction, useState } from "react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { api } from "@/lib/api"
import { toastType, useToast } from "@/components/ui/use-toast"
import SingleSelectField from "@/components/general/selectFields/SingleSelectField"
import { TimePickerSelect } from "@/components/ui/TimePickerSelect"
import { DateSinglePicker } from "@/components/ui/DateSinglePicker"
import { format } from "date-fns"
import Spinner from "@/components/ui/Spinner"

function SchedulePlacementTestModal({ courseId, userId, isScheduleTestOpen, setIsScheduleTestOpen }: { courseId: string; userId: string; isScheduleTestOpen: boolean; setIsScheduleTestOpen: Dispatch<SetStateAction<boolean>> }) {
    const [testTime, setTestTime] = useState<Date | undefined>(new Date(new Date().getMinutes() >= 30 ? new Date().setHours(new Date().getHours() + 1, 0) : new Date().setMinutes(30)))
    const [testDate, setTestDate] = useState<Date | undefined>(new Date())
    const [testerId, setTrainerId] = useState<string>()
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const { data: testersData } = api.trainers.getAvialableTesters.useQuery({ startTime: testTime! }, { enabled: !!testTime })
    const { data: zoomClients } = api.zoomAccounts.getZoomAccounts.useQuery();

    const trpcUtils = api.useUtils()
    const courseQuery = api.courses.getById.useQuery({ id: courseId }, { enabled: false })

    const checkExistingPlacementTestMutation = api.placementTests.checkExistingPlacementTest.useMutation()
    const createPlacementTestMutation = api.placementTests.createPlacementTest.useMutation()
    const deletePlacementTestMutation = api.placementTests.deletePlacementTest.useMutation()
    const createMeetingMutation = api.zoomMeetings.createMeeting.useMutation()
    const getAvialableClientMutation = api.zoomAccounts.getAvailableZoomClient.useMutation()

    const handleSchedulePlacementTest = async () => {
        const innerLoadingToast = toast({
            title: "Loading...",
            action: <Spinner size={20} />,
            duration: 60000,
            variant: "info",
        })
        setLoadingToast(innerLoadingToast)

        try {
            if (!testTime) return innerLoadingToast.update({ id: innerLoadingToast.id, title: "Error", action: undefined, variant: "destructive", description: "please select a time!" })
            if (!testDate) return innerLoadingToast.update({ id: innerLoadingToast.id, title: "Error", action: undefined, variant: "destructive", description: "please select a date!" })
            if (!testerId) return innerLoadingToast.update({ id: innerLoadingToast.id, title: "Error", action: undefined, variant: "destructive", description: "please select a trainer!" })

            testDate.setHours(testTime.getHours(), testTime.getMinutes(), 0, 0)

            const { data } = await courseQuery.refetch()
            const courseId = data?.course?.id
            const courseName = data?.course?.name
            const evaluationFormId = data?.course?.systemForms.find(form => form.type === "PlacementTest")?.id
            const showError = (message: string) =>
                innerLoadingToast.update({
                    id: innerLoadingToast.id,
                    title: "Error",
                    variant: "destructive",
                    action: undefined,
                    description: message,
                });

            if (!userId) return showError("User ID is missing!");
            if (!courseId) return showError("Course ID is missing!");
            if (!courseName) return showError("Course name is missing!");
            if (!evaluationFormId) return showError("Evaluation form ID is missing!");

            const { zoomClient } = await getAvialableClientMutation.mutateAsync({ startDate: testDate, isTest: true })
            const zoomClientId = zoomClient.id

            const { meetingNumber, meetingPassword } = await createMeetingMutation.mutateAsync({
                startDate: testDate,
                zoomClientId,
                topic: `Placement test for ${courseName} course`
            })

            const { oldTest } = await checkExistingPlacementTestMutation.mutateAsync({ courseId, userId })

            if (oldTest) {
                await deletePlacementTestMutation.mutateAsync({ ids: [oldTest.id] })
            }

            const { placementTest } = await createPlacementTestMutation.mutateAsync({
                userId,
                testerId,
                courseId,
                meetingNumber,
                meetingPassword,
                zoomClientId,
                testTime: testDate,
                courseName,
                evaluationFormId,
                isZoom: zoomClient.isZoom,
            })

            await trpcUtils.leads.getByCode.invalidate()

            innerLoadingToast.update({
                id: innerLoadingToast.id,
                title: "Success",
                action: undefined,
                description: `Placement test created at ${format(placementTest.oralTestTime, "PPPPpp")}`,
                variant: "success"
            })

            innerLoadingToast.dismissAfter()
            setLoadingToast(undefined)
            setIsScheduleTestOpen(false)
        } catch (error: any) {
            innerLoadingToast.update({ id: innerLoadingToast.id, title: "Error", action: undefined, variant: "destructive", description: error.message })
        } finally {
            innerLoadingToast.dismissAfter()
            setLoadingToast(undefined)
        }
    }

    return (
        <Modal
            description="Select a time for the Student test"
            isOpen={isScheduleTestOpen}
            onClose={() => setIsScheduleTestOpen(false)}
            title="Schedule"
        >
            <div className="space-y-4 p-2">
                <TimePickerSelect
                    date={testTime}
                    setDate={setTestTime}
                />
                <DateSinglePicker
                    trainerSessions={testersData?.trainers.find(t => t.id === testerId)?.assignedTests.map(t => t.oralTestTime) || []}
                    hours={testTime?.getHours() || 0}
                    minutes={testTime?.getMinutes() || 0}
                    zoomClients={zoomClients?.zoomAccounts || []}
                    date={testDate}
                    setDate={setTestDate}
                    isTest
                />
                <SingleSelectField
                    data={
                        testersData?.trainers
                            ? testersData.trainers.map(trainer => ({
                                Active: true,
                                label: trainer.user.name,
                                value: trainer.id,
                            }))
                            : []
                    }
                    isLoading={!!loadingToast}
                    title="Testers"
                    placeholder="Select Tester"
                    selected={testerId}
                    setSelected={setTrainerId}
                />
                <div>
                    <Button disabled={!!loadingToast} onClick={handleSchedulePlacementTest}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default SchedulePlacementTestModal