import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { QuizRow } from "@/components/contentComponents/quizzes/QuizzesColumn";
import { CustomFormModal } from "@/components/systemForms/CustomFormModal";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { api } from "@/lib/api";
import { AlertModal } from "@/components/modals/AlertModal";
import { useRouter } from "next/router";
import Link from "next/link";
import { EyeIcon } from "lucide-react";

const ActionCell = (rowData: QuizRow) => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string

    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const { toast } = useToast()
    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemForms.deleteSystemForms.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: () => {
                setIsDeleteOpen(false)
                return `Quiz Deleted`
            },
            loadingMessage: "Deleting..."
        })
    )

    const onDelete = () => {
        deleteMutation.mutate([rowData.id])
    }

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <CustomFormModal isOpen={isEditOpen} setIsOpen={setIsEditOpen} systemForm={rowData.systemForm} />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/student/my_courses/${courseSlug}/${rowData.levelSlug}/Quiz/${rowData.systemForm.materialItem?.slug}`}>
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
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default ActionCell;
