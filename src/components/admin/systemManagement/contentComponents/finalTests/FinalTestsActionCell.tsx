import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, SpinnerButton } from "@/components/ui/button";
import { Edit, Edit3Icon, EyeIcon, ChevronDownIcon, PlusCircleIcon, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Prisma } from "@prisma/client";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";
import { CustomFormModal } from "@/components/admin/systemManagement/systemForms/CustomFormModal";
import { useRouter } from "next/router";
import Link from "next/link";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { Textarea } from "@/components/ui/textarea";

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

    const { toastSuccess, toastError, toast } = useToast();
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isOralTestOpen, setIsOralTestOpen] = useState(false)
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [oralText, setOralText] = useState(systemForm.oralTestQuestions ? systemForm.oralTestQuestions : "")

    const trpcUtils = api.useUtils()
    const deleteMutation = api.systemForms.deleteSystemForms.useMutation()
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

    const onUpsertOralTest = () => {
        upsertOralTestMutation.mutate({
            formId: systemForm.id,
            questions: oralText,
        })
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
            <DropdownMenu open={isOpen} onOpenChange={(val) => { setIsOpen(val) }}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/student/my_courses/${courseSlug}/${levelSlug}/final_test`}>
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
