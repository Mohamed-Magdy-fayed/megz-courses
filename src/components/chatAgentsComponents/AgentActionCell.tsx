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

interface AgentCellActionProps {
    id: string;
}

const AgentCellAction: React.FC<AgentCellActionProps> = ({ id }) => {
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const deleteMutation = api.chatAgents.deleteChatAgent.useMutation()
    const trpcUtils = api.useContext()

    const onDelete = async () => {
        try {
            setLoading(true);
            deleteMutation.mutate(
                [id],
                {
                    onSuccess: () => {
                        toastSuccess("Agent(s) deleted")
                        trpcUtils.chatAgents.invalidate().then(() => {
                            setLoading(false);
                            setOpen(false);
                        });
                    },
                    onError: (error) => {
                        toastError(error.message);
                    },
                }
            );
        } catch (error: any) {
            toastError(error.message);
        }
    };

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
                    <DropdownMenuItem>
                        <Link className="flex items-center" href={`/account/${id}`}>
                            <SearchSlash className="w-4 h-4 mr-2" />
                            View
                        </Link>
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

export default AgentCellAction;
