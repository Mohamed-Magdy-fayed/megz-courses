import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Coins, Copy, FileStack, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/ui/modal";
import { NotesColumn } from "@/components/notesComponents/NotesColumn";
import SelectField from "@/components/salesOperation/SelectField";
import { validNoteStatus } from "@/lib/enumsTypes";
import { NotesForm } from "@/components/notesComponents/NotesForm";

interface NotesActionsProps {
    data: NotesColumn;
}

const NotesActions: React.FC<NotesActionsProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<typeof validNoteStatus[]>([])
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

    const trpcUtils = api.useContext()
    const deleteMutation = api.notes.deleteNotes.useMutation()
    const { toastInfo, toastSuccess, toastError, toast } = useToast();

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
                        <FileStack className="w-4 h-4 mr-2" />
                        Update Status
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
