import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, SpinnerButton } from "@/components/ui/button";
import { Copy, Edit, Edit3Icon, EyeIcon, ChevronDownIcon, PlusCircleIcon } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import { api } from "@/lib/api";
import { AlertModal } from "@/components/modals/AlertModal";
import { Trash } from "lucide-react";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { useRouter } from "next/router";
import { CustomFormModal } from "@/components/systemForms/CustomFormModal";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

interface ActionCellProps {
    id: string;
    systemForm: Prisma.SystemFormGetPayload<{ include: { materialItem: true, submissions: { include: { student: true } }, items: { include: { questions: { include: { options: true } } } } } }>;
}

const ActionCell: React.FC<ActionCellProps> = ({ id, systemForm }) => {
    const { toastInfo, toast } = useToast();
    const [isOralTestOpen, setIsOralTestOpen] = useState(false)
    const [oralText, setOralText] = useState(systemForm.oralTestQuestions ? systemForm.oralTestQuestions : "")
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const router = useRouter()
    const courseSlug = router.query.courseSlug as string

    const trpcUtils = api.useUtils()

    const deleteMutation = api.systemForms.deleteSystemForms.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedSystemForms }) => `${deletedSystemForms.count} Form deleted`,
            loadingMessage: "Deleting..."
        })
    )

    const upsertOralTestMutation = api.systemForms.upsertOralTest.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ updatedForm }) => {
                setIsOralTestOpen(false)
                return `updated oral test for ${updatedForm.title} Form`
            },
            loadingMessage: "Loading..."
        })
    )

    const onUpsertOralTest = () => {
        upsertOralTestMutation.mutate({
            formId: systemForm.id,
            questions: oralText,
        })
    };

    const onDelete = () => {
        deleteMutation.mutate([id])
    };

    return (
        <>
            <AlertModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <Modal
                title="Add Oral Test"
                description="Add the questions for your test."
                isOpen={isOralTestOpen}
                onClose={() => setIsOralTestOpen(false)}
                children={(
                    <div className="p-2 grid gap-4 place-items-end">
                        <Textarea
                            placeholder="Questions here..."
                            value={oralText}
                            onChange={(e) => setOralText(e.target.value)}
                        />
                        <SpinnerButton
                            icon={PlusCircleIcon}
                            isLoading={!!loadingToast}
                            text="Update"
                            onClick={onUpsertOralTest}
                        />
                    </div>
                )}
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
                        <Link href={`/placement_test/${courseSlug}`}>
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
                        setIsOralTestOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit3Icon className="w-4 h-4 mr-2" />
                        Update Oral Questions
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
