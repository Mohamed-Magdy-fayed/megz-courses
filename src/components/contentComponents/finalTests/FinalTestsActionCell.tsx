import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, EyeIcon, MoreVertical, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";
import { CustomFormModal } from "@/components/systemForms/CustomFormModal";
import { router } from "@trpc/server";
import { useRouter } from "next/router";
import Link from "next/link";

interface ActionCellProps {
    id: string;
    systemForm: Prisma.SystemFormGetPayload<{
        include: {
            materialItem: true,
            submissions: true,
            items: { include: { questions: { include: { options: true } } } },

        }
    }>;
    levelSlug: string;
}

const ActionCell: React.FC<ActionCellProps> = ({ id, systemForm, levelSlug }) => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string

    const { toastSuccess, toastError, toastInfo } = useToast();
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemForms.deleteSystemForms.useMutation()

    const onDelete = (callback?: () => void) => {
        setLoading(true)
        deleteMutation.mutate(
            [id],
            {
                onSuccess: ({ deletedSystemForms }) => {
                    trpcUtils.invalidate()
                        .then(() => {
                            callback?.()
                            toastSuccess(`Deleted ${deletedSystemForms.count} final test`)
                            setLoading(false)
                            setIsDeleteOpen(false)
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
                title="Delete"
                description="Delete evaluation form"
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                children={(
                    <div className="flex w-full items-center justify-end space-x-2 pt-6">
                        <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
                            Continue
                        </Button>
                    </div>
                )}
            />
            <CustomFormModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} systemForm={systemForm} />
            <DropdownMenu open={isOpen} onOpenChange={(val) => { setIsOpen(val) }}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/my_courses/${courseSlug}/${levelSlug}/final_test`}>
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsEditOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsDeleteOpen(true)
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

export default ActionCell;
