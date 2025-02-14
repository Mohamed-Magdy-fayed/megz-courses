import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash, SearchSlash, ChevronDownIcon, Edit } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import SalesAgentForm from "@/components/salesAgentComponents/SalesAgentForm";
import { SalesAgentsColumn } from "@/components/salesAgentComponents/SalesAgentColumn";

interface AgentCellActionProps {
    id: string;
    agent: SalesAgentsColumn
}

const AgentCellAction: React.FC<AgentCellActionProps> = ({ id, agent }) => {
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const deleteMutation = api.salesAgents.deleteSalesAgent.useMutation()
    const trpcUtils = api.useUtils()

    const onDelete = () => {
        setLoading(true);
        deleteMutation.mutate(
            [id],
            {
                onSuccess: () => {
                    trpcUtils.salesAgents.invalidate()
                        .then(() => {
                            toastSuccess("Agent(s) deleted");
                            setLoading(false);
                            setIsDeleteOpen(false);
                        })
                },
                onError: (error) => {
                    toastError(error.message);
                    setLoading(false);
                },
            }
        );
    }

    return (
        <>
            <Modal
                title="Edit"
                description="Edit the sales agent account!"
                isOpen={open}
                onClose={() => setOpen(false)}
                children={(
                    <SalesAgentForm setIsOpen={setOpen} initialData={{ ...agent, id }}></SalesAgentForm>
                )}
            />
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete"
                description="This Action can't be undone!"
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
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
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
                        setOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteOpen(true)
                        setIsOpen(false)
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
