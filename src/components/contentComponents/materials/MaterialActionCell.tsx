import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, Edit, Eye, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import Link from "next/link";

interface CellActionProps {
    id: string;
    courseId: string;
}

const MaterialActionCell: React.FC<CellActionProps> = ({ id, courseId }) => {
    const { toastInfo } = useToast();
    const router = useRouter()

    const onCopy = () => {
        navigator.clipboard.writeText(`${window.location.host}/courses/${courseId}`);
        toastInfo("User link copied to the clipboard");
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
                        <CopyPlus className="w-4 h-4 mr-2" />
                        Dublicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/content/materials/${id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy view link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link target="_blank" href={`/courses/${courseId}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default MaterialActionCell;
