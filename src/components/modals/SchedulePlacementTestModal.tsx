import { Dispatch, SetStateAction, useState } from "react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { toastType, useToast } from "@/components/ui/use-toast"
import SingleSelectField from "@/components/SingleSelectField"
import { TimePickerSelect } from "@/components/ui/TimePickerSelect"
import { DateMultiplePicker } from "@/components/ui/DateMultiplePicker"
import { DateSinglePicker } from "@/components/ui/DateSinglePicker"

function SchedulePlacementTestModal({ leadCode, isScheduleTestOpen, setIsScheduleTestOpen }: { leadCode: string; isScheduleTestOpen: boolean; setIsScheduleTestOpen: Dispatch<SetStateAction<boolean>> }) {
    const [testTime, setTestTime] = useState<Date | undefined>(new Date())
    const [testerId, setTrainerId] = useState<string>()
    const [selectTime, setSelectTime] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const { data: testersData } = api.trainers.getAvialableTesters.useQuery({ startTime: testTime! }, { enabled: !!testTime })
    const { data: zoomClients } = api.zoomAccounts.getZoomAccounts.useQuery();

    const trpcUtils = api.useUtils()
    const createPlacementTestMutation = api.placementTests.schedulePlacementTest.useMutation(
        createMutationOptions({
            trpcUtils,
            toast,
            loadingToast,
            setLoadingToast,
            successMessageFormatter: ({ oldTest }) => {
                setIsScheduleTestOpen(false)
                return oldTest ? "Placement Test Rescheduled Successfully" : "Placement Test Created Successfully"
            }
        })
    )

    const handleSchedulePlacementTest = () => {
        if (!testTime) return toast({ title: "Error", variant: "destructive", description: "please select a time!" })
        if (!testerId) return toast({ title: "Error", variant: "destructive", description: "please select a trainer!" })
        createPlacementTestMutation.mutate({ testTime, leadCode, testerId })
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
                    date={testTime}
                    setDate={setTestTime}
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
                    <Button disabled={!!loadingToast} onClick={() => handleSchedulePlacementTest()}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default SchedulePlacementTestModal