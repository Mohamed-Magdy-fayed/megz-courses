import SelectField from "@/components/ui/SelectField"
import { SpinnerButton } from "@/components/ui/button"
import { toastType, useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { createMutationOptions } from "@/lib/mutationsHelper"
import { PlusSquare, Trash } from "lucide-react"
import { Dispatch, SetStateAction, useState } from "react"

const DeleteStageForm = ({ setIsOpen }: { setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { toast } = useToast()

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [selectedStages, setSelectedStages] = useState<string[]>([])

    const { data } = api.leadStages.getLeadStages.useQuery()

    const trpcUtils = api.useUtils()
    const deleteLeadMutation = api.leadStages.deleteLeadStage.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            toast,
            trpcUtils,
            loadingMessage: "Deleting Stage...",
            successMessageFormatter: ({ deletedLeadStages }) => {
                setIsOpen(false)
                return `Deleted ${deletedLeadStages.count} stages!`
            },
        })
    )

    const handleDelete = () => {
        deleteLeadMutation.mutate(selectedStages)
    }

    return (
        <div>
            <SelectField
                multiSelect
                data={data?.stages.map(s => ({
                    Active: !s.defaultStage,
                    label: s.name,
                    value: s.id,
                })) || []}
                listTitle="Stages"
                placeholder="Select Stages to delete"
                setValues={setSelectedStages}
                values={selectedStages}
                disableSearch
            />
            <div className="flex justify-end">
                <SpinnerButton icon={Trash} customeColor={"destructive"} isLoading={!!loadingToast} text="Delete Stage" type="button" onClick={handleDelete} />
            </div>
        </div>
    )
}

export default DeleteStageForm