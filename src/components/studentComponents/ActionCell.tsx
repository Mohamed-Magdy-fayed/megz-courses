import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical, PackagePlus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DialogPortal, DialogOverlay } from "@radix-ui/react-dialog";
import ModalInDropdownMenu from "../ui/modal-in-dropdown-menu";
import CreateOrder from "../salesOperation/CreateOrder";
import CreateOrderForStudent from "./CreateOrderForStudent";
import { api } from "@/lib/api";
import Spinner from "../Spinner";

interface CellActionProps {
    id: string;
}

const CellAction: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo } = useToast();
    const [loading, setLoading] = useState(false)
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)

    const { data: coursesData } = api.courses.getAll.useQuery()
    const { data: userData } = api.users.getUserById.useQuery({ id })

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button customeColor="mutedIcon" variant={"icon"} >
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {coursesData?.courses && userData?.user
                    ? (
                        <CreateOrderForStudent
                            coursesData={coursesData.courses}
                            loading={loading}
                            open={isCreateOrderModalOpen}
                            setLoading={setLoading}
                            setOpen={setIsCreateOrderModalOpen}
                            userData={userData.user}
                        />
                    )
                    : (
                        <Spinner className="w-4 h-4" />
                    )
                }
                <DropdownMenuItem onClick={onCopy}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy ID
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CellAction;
