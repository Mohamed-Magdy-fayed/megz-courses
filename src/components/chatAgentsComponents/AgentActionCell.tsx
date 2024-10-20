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
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import Modal from "@/components/ui/modal";

interface AgentCellActionProps {
    id: string;
}

const AgentCellAction: React.FC<AgentCellActionProps> = ({ id }) => {
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const deleteMutation = api.chatAgents.deleteChatAgent.useMutation()
    const trpcUtils = api.useUtils()

    const onDelete = () => {
        setLoading(true);
        deleteMutation.mutate(
            [id],
            {
                onSuccess: () => {
                    trpcUtils.chatAgents.invalidate().then(() => {
                        toastSuccess("Agent(s) deleted")
                        setLoading(false);
                        setIsDeleteOpen(false);
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
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
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
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsDeleteOpen(true)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default AgentCellAction;
