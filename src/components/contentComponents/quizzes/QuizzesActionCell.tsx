import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import ConnectGoogleForm from "@/components/FormsComponents/ConnectGoogleForm";
import CustomForm from "@/components/FormsComponents/CustomForm";
import { QuizRow } from "@/components/contentComponents/quizzes/QuizzesColumn";

const ActionCell = (rowData: QuizRow) => {
    const { toastInfo } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(rowData.id);
        toastInfo("ID copied to the clipboard");
    };

    return (
        <>
            <Modal
                title="Edit"
                description="edit evaluation form"
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                children={(
                    <div>
                        {rowData.externalLink ? <ConnectGoogleForm setIsOpen={setIsEditOpen} initialData={rowData.evalForm} /> : <CustomForm initialData={rowData.evalForm} />}
                    </div>
                )}
            />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsEditOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;
