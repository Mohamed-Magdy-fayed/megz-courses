import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash, SearchSlash, MoreVertical, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { AssignModal } from "../modals/AssignModal";

interface CellActionProps {
    id: string;
    assigneeId: string;
    code: string;
}

const CellAction: React.FC<CellActionProps> = ({ id, assigneeId, code }) => {
    const { toast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        toast({
            description: "Category ID copied to the clipboard",
            variant: "info"
        });
    };

    const deleteMutation = api.salesOperations.deleteSalesOperations.useMutation()
    const trpcUtils = api.useContext()

    const onDelete = async () => {
        try {
            console.log(id);

            setLoading(true);
            deleteMutation.mutate(
                [id],
                {
                    onSuccess: () => {
                        toast({
                            description: "Operation(s) deleted",
                            variant: "success"
                        });
                        trpcUtils.salesOperations.invalidate();
                    },
                    onError: () => {
                        toast({
                            description: "somthing went wrong",
                            variant: "destructive"
                        });
                    },
                }
            );
        } catch (error: any) {
            toast({
                description: "an error occured",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    const [assignIsOpen, setAssingIsOpen] = useState(false);

    const assignOperationMutation = api.salesOperations.assignSalesOperation.useMutation()
    const handleCreateOperation = (assigneeId: string) => {
        setLoading(true)
        assignOperationMutation.mutate(
            { id, assigneeId },
            {
                onSuccess: (data) => {
                    toast({
                        variant: "success",
                        description: `Assigned successfully to ${data.salesOperations.assignee?.user.email}`
                    })
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        description: `an error occured ${error}`
                    })
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

export default CellAction;
