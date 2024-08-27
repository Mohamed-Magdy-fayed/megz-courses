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
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SalesOperationStatus } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Modal from "@/components/ui/modal";

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
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
            <Modal
                title="Assign Task"
                description="Please select the assignee!"
                isOpen={assignIsOpen}
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
            />
            <Modal
                title="Are you sure?"
                description="This action can't be undone!"
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                children={
                    <div className="flex w-full items-center justify-end space-x-2 pt-6">
                        <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
                            Continue
                        </Button>
                    </div>
                }
            />
            <DropdownMenu open={open} onOpenChange={(val) => setOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {isOperationManger ? (
                        <DropdownMenuItem onClick={() => {
                            setAssignIsOpen(true)
                            setOpen(false)
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
                        <Link className="flex gap-2" href={`/sales_operations/${code}`}>
                            <SearchSlash className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteOpen(true)
                        setOpen(false)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
