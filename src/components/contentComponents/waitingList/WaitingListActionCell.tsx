import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PlacmentTestModal from "@/components/modals/PlacmentTestModal";
import OralTestModal from "@/components/modals/OralTestModal";
import { RefundModal } from "@/components/modals/RefundModal";
import { useState } from "react";

interface CellActionProps {
    id: string;
}

const WaitingListActionCell: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo } = useToast();
    const [isOpen, setIsOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    return (
        <>
            <RefundModal
                isOpen={isOpen}
                loading={false}
                onClose={() => setIsOpen(false)}
                onConfirm={(data) => {
                    console.log(data)
                    setIsOpen(false)
                }}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                        <PlacmentTestModal id={id} />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                        <OralTestModal id={id} />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Refund
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default WaitingListActionCell;
