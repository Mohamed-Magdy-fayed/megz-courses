import { SpinnerButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Typography } from "@/components/ui/Typoghraphy"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { CheckSquare, Trash } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"

const MoveStageForm = ({ setIsOpen }: { setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { data } = api.leadStages.getLeadStages.useQuery()
    const [stages, setStages] = useState<{ id: string, order: number }[]>(data?.stages.map(s => ({ id: s.id, order: s.order })) || [])

    const trpcUtils = api.useUtils()
    const moveStagesMutation = api.leadStages.moveStages.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Moving Stages...",
            successMessageFormatter: () => {
                setIsOpen(false)
                return `The stages order has been updated!`
            },
        })
    )

    const handleMove = () => {
        moveStagesMutation.mutate({
            newOrders: stages,
        })
    }

    return (
        <div className="space-y-4 p-2">
            <div className="flex items-center justify-between gap-4">
                <Typography>Stage Name</Typography>
                <Typography>Stage Order</Typography>
            </div>
            {data?.stages.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-4">
                    <Typography>{s.name}</Typography>
                    <Input
                        className="w-min"
                        min={2}
                        max={data?.stages.length - 3}
                        type="number"
                        value={stages.find(stage => stage.id === s.id)?.order}
                        onChange={(e) => setStages(prev => prev.map(item => item.id === s.id ? ({ id: item.id, order: Number(e.target.value) }) : item))}
                    />
                </div>
            ))}
            <div className="flex justify-end">
                <SpinnerButton
                    icon={CheckSquare}
                    isLoading={!!loadingToast}
                    text="Confirm"
                    type="button"
                    onClick={handleMove}
                />
            </div>
        </div>
    )
}

export default MoveStageForm