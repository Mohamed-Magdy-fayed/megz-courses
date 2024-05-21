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

interface ActionCellProps {
    id: string;
    studentId: string;
    courseId: string;
}

const ActionCell: React.FC<ActionCellProps> = ({ id, studentId, courseId }) => {
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
                        <PlacmentTestModal id={studentId} courseTestId={id} courseId={courseId} />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                        <OralTestModal id={studentId} courseTestId={id} courseId={courseId} />
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

export default ActionCell;
