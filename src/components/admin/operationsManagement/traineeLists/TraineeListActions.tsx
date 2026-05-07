import { TraineeList } from "@/components/admin/operationsManagement/traineeLists/TraineeListColumn";
import SubmitLevelModal from "@/components/general/modals/SubmitLevelModal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { CheckSquare, ChevronDownIcon, Edit, Trash } from "lucide-react";
import { useEffect, useState } from "react";

export default function TraineeListActions(trainee: TraineeList) {
    const { toast, toastError } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isSubmitLevelOpen, setIsSubmitLevelOpen] = useState(false)
    const [oralFeedback, setOralFeedback] = useState("")
    const [level, setLevel] = useState<string>()
    const [confirmPartialAllocation, setConfirmPartialAllocation] = useState(false)

    const courseLevels = trainee.levelIds.map(l => ({ id: l.value, name: l.label }))

    const { data: allocationPreview, isFetching: isAllocationPreviewLoading } = api.waitingList.getPlacementAllocationPreview.useQuery(
        { courseId: trainee.courseId, userId: trainee.id, levelId: level || "" },
        { enabled: isSubmitLevelOpen && !!level }
    )

    useEffect(() => {
        setConfirmPartialAllocation(false)
    }, [level, isSubmitLevelOpen])

    const trpcUtils = api.useUtils()
    const addToWaitingListMutation = api.waitingList.addToWaitingList.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ course, user }) => {
                setIsSubmitLevelOpen(false)
                return `Added Student ${user.name} to Waiting list of course ${course.name} at level ${courseLevels.find(courseLevel => courseLevel.id === level)?.name}`
            },
        })
    )
    // const deleteMutation = api.products.delete.useMutation(
    //     createMutationOptions({
    //         trpcUtils: trpcUtils.products,
    //         loadingToast,
    //         setLoadingToast,
    //         toast,
    //         successMessageFormatter: ({ products }) => {
    //             return `${products.count} products deleted`
    //         },
    //         loadingMessage: "Deleting...",
    //     })
    // )

    // const onDelete = () => {
    //     deleteMutation.mutate([product.id])
    // };

    const handleSubmitLevel = () => {
        if (!level) return toastError("Please select a Level")
        if (allocationPreview?.missingLevelsCount && !confirmPartialAllocation) {
            return toastError("Please confirm partial allocation before submitting")
        }

        addToWaitingListMutation.mutate({
            courseId: trainee.courseId,
            levelId: level,
            userId: trainee.id,
            oralFeedback,
            acceptPartialAllocation: confirmPartialAllocation,
        })
    };

    return (
        <>
            {/* <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            /> */}
            <SubmitLevelModal
                courseName={trainee.courseName}
                isOpen={isSubmitLevelOpen}
                setIsOpen={setIsSubmitLevelOpen}
                oralFeedback={oralFeedback}
                setOralFeedback={setOralFeedback}
                loading={!!loadingToast}
                level={level}
                setLevel={setLevel}
                courseLevels={courseLevels}
                handleSubmitLevel={handleSubmitLevel}
                oralQuestions={""}
                allocationPreview={allocationPreview}
                isPreviewLoading={isAllocationPreviewLoading}
                confirmPartialAllocation={confirmPartialAllocation}
                setConfirmPartialAllocation={setConfirmPartialAllocation}
            />
            <DropdownMenu open={isMenuOpen} onOpenChange={(val) => setIsMenuOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0">
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem disabled={!!trainee.levelName} onClick={() => {
                        setIsMenuOpen(false)
                        setIsSubmitLevelOpen(true)
                    }}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Submit Level
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled onClick={() => {
                        // setIsEditOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        edit
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled onClick={() => {
                        setIsDeleteOpen(true)
                        setIsMenuOpen(false)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
