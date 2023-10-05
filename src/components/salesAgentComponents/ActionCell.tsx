import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash, SearchSlash, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToastStore } from "@/zustand/store";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";

interface CellActionProps {
    id: string;
    assigneeId: string;
    code: string;
}

const CellAction: React.FC<CellActionProps> = ({ id, assigneeId, code }) => {
    const toast = useToastStore();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(code);
        toast.success("Category ID copied to the clipboard");
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
                        toast.info("Operation(s) deleted");
                        trpcUtils.salesOperations.invalidate();
                    },
                    onError: () => {
                        toast.error("somthing went wrong");
                    },
                }
            );
        } catch (error: any) {
            toast.error("an error occured");
        } finally {
            setLoading(false);
            setOpen(false);
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
                    <DropdownMenuItem
                        onClick={() =>
                            router.push(`/ops/${id}`)
                        }
                    >
                        <SearchSlash className="w-4 h-4 mr-2" />
                        View
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
