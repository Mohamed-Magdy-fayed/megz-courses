import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash, SearchSlash, MoreVertical, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SalesOperationStatus } from "@prisma/client";
import ModalInDropdownMenu from "../ui/modal-in-dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface CellActionProps {
    id: string;
}

const CellAction: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo, toastError, toastSuccess } = useToast();
    const session = useSession();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [assigneeIdForAssign, setAssigneeIdForAssign] = useState("");

    const deleteMutation = api.salesOperations.deleteSalesOperations.useMutation()
    const trpcUtils = api.useContext()

    const onDelete = (callback?: () => void) => {
        setLoading(true);
        deleteMutation.mutate(
            [id],
            {
                onSuccess: () => {
                    trpcUtils.salesOperations.invalidate()
                        .then(() => {
                            callback?.()
                            toastSuccess("Time deleted");
                            setLoading(false);
                            setOpen(false);
                        })
                },
                onError: (error) => {
                    toastError(error.message)
                    setLoading(false);
                },
            }
        );
    };

    const [assignIsOpen, setAssignIsOpen] = useState(false);

    const assignOperationMutation = api.salesOperations.assignSalesOperation.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: (data) => {
            toastSuccess(`Assigned successfully to ${data.salesOperations.assignee?.user.email}`)
        },
        onError: (error) => {
            toastError(error.message)
        },
        onSettled: () => {
            trpcUtils.salesOperations.invalidate()
                .then(() => {
                    setAssignIsOpen(false)
                    setLoading(false)
                })
        }
    })
    const handleCreateOperation = (assigneeId: string) => {
        assignOperationMutation.mutate({ id, assigneeId })
    }

    const handleAssignToMe = () => {
        if (!session.data?.user.id) return toastError("Not authenticated")
        assignOperationMutation.mutate({ id, assigneeId: session.data?.user.id })
    }

    return (
        <>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
