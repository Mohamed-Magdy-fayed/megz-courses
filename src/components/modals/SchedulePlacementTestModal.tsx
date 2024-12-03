import { Dispatch, SetStateAction, useState } from "react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TimePicker } from "@/components/ui/TimePicker"
import { CalendarIcon, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import CalenderComp from "@/components/ui/calendar"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { toastType, useToast } from "@/components/ui/use-toast"
import SingleSelectField from "@/components/SingleSelectField"

function SchedulePlacementTestModal({ leadCode, isScheduleTestOpen, setIsScheduleTestOpen }: { leadCode: string; isScheduleTestOpen: boolean; setIsScheduleTestOpen: Dispatch<SetStateAction<boolean>> }) {
    const [testTime, setTestTime] = useState<Date | undefined>(new Date())
    const [testerId, setTrainerId] = useState<string>()
    const [selectTime, setSelectTime] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const { data: testersData } = api.trainers.getAvialableTesters.useQuery({ startTime: testTime! }, { enabled: !!testTime })

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