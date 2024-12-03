import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileCheck2Icon, MoreVertical, Trash2Icon } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { AlertModal } from "@/components/modals/AlertModal";
import { PlacementTestSubmissionsRow } from "@/components/contentComponents/placmentTestSubmissions/PlacmentTestSubmissionsColumn";

interface ActionCellProps {
    id: string;
    submission: PlacementTestSubmissionsRow;
}

const ActionCell: React.FC<ActionCellProps> = ({ id, submission }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isUpdateRatingOpen, setIsUpdateRatingOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType | undefined>()

    const { toast } = useToast();
    const trpcUtils = api.useUtils()

    const deleteMutation = api.systemFormSubmissions.deleteSystemFormSubmission.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: () => {
                setIsDeleteOpen(false)
                return `Deleted submission successfully!`
            }
        })
    )

    const onDelete = () => {
        deleteMutation.mutate({ ids: [id] })
    }

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={onDelete}
                loading={!!loadingToast}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsUpdateRatingOpen(true)
                    }}>
                        <FileCheck2Icon className="w-4 h-4 mr-2" />
                        Update Rating
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsDeleteOpen(true)
                    }}>
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;
