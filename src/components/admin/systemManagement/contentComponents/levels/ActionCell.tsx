import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import { useRouter } from "next/router";
import { useToast } from "@/components/ui/use-toast";
import LevelForm from "@/components/admin/systemManagement/contentComponents/levels/LevelForm";

interface CellActionProps {
    id: string;
    name: string;
    slug: string;
}

const CellAction: React.FC<CellActionProps> = ({ id, name, slug }) => {
    const { toastInfo } = useToast();
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const router = useRouter()
    const courseSlug = router.query.courseSlug as string

    const onCopy = () => {
        navigator.clipboard.writeText(id);
        toastInfo("ID copied to the clipboard");
    };

    return (
        <>
            <Modal
                title="Edit"
                description="Edit the level details"
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                children={(
                    <LevelForm courseSlug={courseSlug} setIsOpen={setIsEditOpen} initialData={{ id, name, slug }} />
                )}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsEditOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
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
