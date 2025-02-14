import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, EyeIcon, ChevronDownIcon, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import { api } from "@/lib/api";
import { AlertModal } from "@/components/modals/AlertModal";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { CustomFormModal } from "@/components/systemForms/CustomFormModal";
import Link from "next/link";
import { useRouter } from "next/router";

interface ActionCellProps {
    id: string;
    systemForm: Prisma.SystemFormGetPayload<{ include: { materialItem: true, submissions: { include: { student: true } }, items: { include: { questions: { include: { options: true } } } } } }>;
    levelSlug: string;
}

const ActionCell: React.FC<ActionCellProps> = ({ id, systemForm, levelSlug }) => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string

    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemForms.deleteSystemForms.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedSystemForms }) => {
                return `${deletedSystemForms.count} forms deleted`
            },
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = () => {
        deleteMutation.mutate([id])
    }

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <CustomFormModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} systemForm={systemForm} />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/my_courses/${courseSlug}/${levelSlug}/Assignment/${systemForm.materialItem?.slug}`}>
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
