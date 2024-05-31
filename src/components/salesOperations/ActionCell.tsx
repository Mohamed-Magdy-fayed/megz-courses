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
import { AssignModal } from "../modals/AssignModal";
import { useSession } from "next-auth/react";
import { SalesOperationStatus } from "@prisma/client";

interface CellActionProps {
    id: string;
    assigneeId: string;
    code: string;
    status: SalesOperationStatus;
}

const CellAction: React.FC<CellActionProps> = ({ id, assigneeId, code, status }) => {
    const { toastInfo, toastError, toastSuccess } = useToast();
    const session = useSession();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        toastInfo("Operation code copied to the clipboard");
    };

    const isOperationAssigned = useMemo(() => status === "created", [status])
    const isOperationManger = useMemo(() => session.data?.user.userType === "admin", [session.data?.user.userType])
    const operationAssignedForCurrentUser = useMemo(() => session.data?.user.id === assigneeId, [session.data?.user.id, assigneeId])
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
            <AlertModal
                isOpen={open}
                loading={loading}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
            />
            <AssignModal
                isOpen={assignIsOpen}
                loading={loading}
                onClose={() => setAssignIsOpen(false)}
                onConfirm={handleCreateOperation}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {isOperationManger ? (
                        <DropdownMenuItem onClick={(e) => {
                            e.preventDefault()
                            setAssignIsOpen(true)
                        }}>
                            <Workflow className="w-4 h-4 mr-2" />
                            Assign
                        </DropdownMenuItem>
                    ) : !operationAssignedForCurrentUser && !isOperationAssigned ? null : (
                        <DropdownMenuItem onClick={handleAssignToMe}>
                            <Workflow className="w-4 h-4 mr-2" />
                            Assign to me
                        </DropdownMenuItem>
                    )}
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

export default CellAction;
