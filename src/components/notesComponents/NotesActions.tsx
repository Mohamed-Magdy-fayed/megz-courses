import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/ui/modal";
import { NotesColumn } from "@/components/notesComponents/NotesColumn";
import { NotesForm } from "@/components/notesComponents/NotesForm";
import { Edit } from "lucide-react";

interface NotesActionsProps {
    data: NotesColumn;
}

const NotesActions: React.FC<NotesActionsProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

    const trpcUtils = api.useUtils()
    const deleteMutation = api.notes.deleteNotes.useMutation()
    const { toastSuccess, toastError } = useToast();

    const onCopy = () => {
        navigator.clipboard.writeText(data.id);
        toastSuccess("Note ID copied to the clipboard")
    };

    const onDelete = (callback?: () => void) => {
        setLoading(true)
        deleteMutation.mutate(
            { ids: [data.id] },
            {
                onSuccess: ({ notes }) => {
                    trpcUtils.orders.invalidate()
                        .then(() => {
                            callback?.()
                            toastSuccess(`Deleted ${notes.count} note(s)`)
                            setLoading(false)
                            setOpen(false)
                        })
                },
                onError: (error) => {
                    toastError(error.message)
                    setLoading(false)
                },
            }
        )
    };

    return (
        <>
            <Modal
                title="Edit"
                description="Edit a note"
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                children={(
                    <div>
                        <NotesForm initialData={data} setIsOpen={setIsStatusModalOpen} />
                    </div>
                )}
            />
            <Modal
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Delete"
                description="This action can't be undone!"
                children={
                    <div className="flex w-full items-center justify-end space-x-2 pt-6">
                        <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setOpen(false)}>
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
                    <Button variant="outline" customeColor={"mutedOutlined"} className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy()}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Id
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsStatusModalOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setOpen(true)
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

export default NotesActions;
