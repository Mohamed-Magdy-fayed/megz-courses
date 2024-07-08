import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash, SearchSlash, MoreVertical } from "lucide-react";
import { useState } from "react";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import ModalInDropdownMenu from "../ui/modal-in-dropdown-menu";

interface AgentCellActionProps {
    id: string;
}

const AgentCellAction: React.FC<AgentCellActionProps> = ({ id }) => {
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const deleteMutation = api.chatAgents.deleteChatAgent.useMutation()
    const trpcUtils = api.useContext()

    const onDelete = () => {
        setLoading(true);
        deleteMutation.mutate(
            [id],
            {
                onSuccess: () => {
                    trpcUtils.chatAgents.invalidate().then(() => {
                        toastSuccess("Agent(s) deleted")
                        setLoading(false);
                        setOpen(false);
                    });
                },
                onError: (error) => {
                    toastError(error.message);
                },
            }
        );
    };

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
                        <Link className="flex items-center" href={`/account/${id}`}>
                            <SearchSlash className="w-4 h-4 mr-2" />
                            View
                        </Link>
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

export default AgentCellAction;
