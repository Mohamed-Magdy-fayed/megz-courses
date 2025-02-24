import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditIcon, ChevronDownIcon, Trash2Icon } from "lucide-react";
import { toastType, useToast } from "../ui/use-toast";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import TrainerForm from "@/components/staffComponents/TrainerForm";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { TrainerColumn } from "@/components/staffComponents/StaffColumns";

const EducationalTeamActionCell: React.FC<{ trainerUser: TrainerColumn }> = ({ trainerUser }) => {
    const { toast } = useToast();
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const trpcUtils = api.useUtils()
    const deleteMutation = api.trainers.deleteTrainer.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: () => {
                setIsDeleteOpen(false)
                return `Deleted!`
            }
        })
    )

    const onDelete = () => {
        deleteMutation.mutate([trainerUser.id]);
    }

    return (
        <>
            <Modal
                title="Edit"
                description="Edit the sales agent account!"
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                children={(
                    <TrainerForm setIsOpen={setIsEditOpen} initialData={trainerUser}></TrainerForm>
                )}
            />
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete"
                description="This Action can't be undone!"
                children={
                    <div className="flex w-full items-center justify-end space-x-2 pt-6">
                        <Button disabled={!!loadingToast} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!!loadingToast} customeColor="destructive" onClick={() => onDelete()}>
                            Continue
                        </Button>
                    </div>
                }
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsEditOpen(true)
                        setIsOpen(false)
                    }}>
                        <EditIcon className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteOpen(true)
                        setIsOpen(false)
                    }}>
                        <Trash2Icon className="w-4 h-4 mr-2" />
                        Delte
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default EducationalTeamActionCell;
