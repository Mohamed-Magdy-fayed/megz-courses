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
    assigneeId: string;
    code: string;
    status: SalesOperationStatus;
}

const CellAction: React.FC<CellActionProps> = ({ id, assigneeId, code, status }) => {
    const { toastInfo, toastError, toastSuccess } = useToast();
    const session = useSession();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [assigneeIdForAssign, setAssigneeIdForAssign] = useState("");

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        toastInfo("Operation code copied to the clipboard");
    };

    const isOperationAssigned = useMemo(() => status === "created", [status])
    const isOperationManger = useMemo(() => session.data?.user.userType === "admin", [session.data?.user.userType])
    const operationAssignedForCurrentUser = useMemo(() => session.data?.user.id === assigneeId, [session.data?.user.id, assigneeId])
    const { data: salesAgentsData } = api.users.getUsers.useQuery({ userType: "salesAgent" })
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {isOperationManger ? (
                        <ModalInDropdownMenu
                            title="Assign Task"
                            description="Please select the assignee!"
                            isOpen={assignIsOpen}
                            onOpen={() => setAssignIsOpen(true)}
                            onClose={() => setAssignIsOpen(false)}
                            children={
                                <>
                                    <Select
                                        disabled={loading}
                                        // @ts-ignore
                                        onValueChange={(e) => setAssigneeIdForAssign(e)}
                                    >
                                        <SelectTrigger className="pl-8">
                                            <SelectValue
                                                placeholder="Select assignee"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salesAgentsData?.users.map(user => (
                                                <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex w-full items-center justify-end space-x-2 pt-6">
                                        <Button disabled={loading} variant="outline" customeColor={"mutedOutlined"} onClick={() => setAssignIsOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button disabled={loading} variant="default" onClick={() => handleCreateOperation(assigneeIdForAssign)}>
                                            Continue
                                        </Button>
                                    </div>
                                </>
                            }
                            itemChildren={
                                <>
                                    <Workflow className="w-4 h-4 mr-2" />
                                    Assign
                                </>
                            }
                        />
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
                    <ModalInDropdownMenu
                        title="Are you sure?"
                        description="This action can't be undone!"
                        isOpen={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        children={
                            <div className="flex w-full items-center justify-end space-x-2 pt-6">
                                <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
                                    Continue
                                </Button>
                            </div>
                        }
                        itemChildren={
                            <>
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                            </>
                        }
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
