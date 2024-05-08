import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical } from "lucide-react";
import { useToast } from "../ui/use-toast";
import PlacmentTestModal from "./PlacmentTestModal";
import OralTestModal from "./OralTestModal";

interface CellActionProps {
    id: string;
}

const CellAction: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo } = useToast();


    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("Category ID copied to the clipboard");
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
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CellAction;
