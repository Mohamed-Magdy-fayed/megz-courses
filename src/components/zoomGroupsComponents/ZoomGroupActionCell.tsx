import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash, SearchSlash, MoreVertical, Workflow } from "lucide-react";
import { useState } from "react";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { AssignModal } from "../modals/AssignModal";

interface ZoomGroupActionCellProps {
    id: string;
}

const ZoomGroupActionCell: React.FC<ZoomGroupActionCellProps> = ({ id }) => {
    const { toastInfo, toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("Category ID copied to the clipboard");
    };

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
                            callback && callback()
                            toastSuccess("Operation(s) deleted");
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

    const [assignIsOpen, setAssingIsOpen] = useState(false);

    const assignOperationMutation = api.salesOperations.assignSalesOperation.useMutation()
    const handleCreateOperation = (assigneeId: string) => {
        setLoading(true)
        assignOperationMutation.mutate(
            { id, assigneeId },
            {
                onSuccess: (data) => {
                    toastSuccess(`Assigned successfully to ${data.salesOperations.assignee?.user.email}`)
                },
                onError: (error) => {
                    toastError(error.message)
                },
                onSettled: () => {
                    trpcUtils.salesOperations.invalidate()
                    setAssingIsOpen(false)
                    setLoading(false)
                }
            }
        )
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                loading={loading}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e) => {
                        e.preventDefault()
                        setAssingIsOpen(true)
                    }}>
                        <AssignModal
                            isOpen={assignIsOpen}
                            loading={loading}
                            onClose={() => setAssingIsOpen(false)}
                            onConfirm={handleCreateOperation}
                        />
                        <Workflow className="w-4 h-4 mr-2" />
                        Assign
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link className="flex gap-2" href={`/operation/${id}`}>
                            <SearchSlash className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ZoomGroupActionCell;
