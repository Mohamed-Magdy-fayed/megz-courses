import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, Edit, MoreVertical, PlusSquare, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";
import Spinner from "@/components/Spinner";
import CourseForm from "./CourseForm";
import { useRouter } from "next/router";
import Modal from "@/components/ui/modal";
import { env } from "@/env.mjs";
import { AlertModal } from "@/components/modals/AlertModal";
import { createMutationOptions } from "@/lib/mutationsHelper";

interface CellActionProps {
    id: string;
    slug: string;
    levels: string[];
    name: string;
    description: string;
    image: string;
    privatePrice: number;
    groupPrice: number;
    instructorPrice: number;
}

const CoursesActionCell: React.FC<CellActionProps> = ({ id, slug, description, groupPrice, image, instructorPrice, levels, name, privatePrice }) => {
    const { toastInfo, toast } = useToast();
    const [isOpen, setIsOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(`${env.NEXT_PUBLIC_NEXTAUTH_URL}content/courses/${slug}`);
        toastInfo("Course link copied to the clipboard");
    };

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const router = useRouter()
    const trpcUtils = api.useUtils()
    const dublicateMutation = api.courses.dublicateCourse.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ course }) => {
                return `${course.name} dublicated successfully`
            },
            loadingMessage: "dublicating...",
        })
    )

    const deleteMutation = api.courses.deleteCourses.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedCourses }) => {
                return `${deletedCourses.count} courses deleted`
            },
            loadingMessage: "Deleting...",
        })
    )

    const onDelete = () => {
        deleteMutation.mutate([id])
    };

    const onDublicate = () => {
        dublicateMutation.mutate({ id })
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
                title="Edit Course"
                description="Update the course details"
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                children={(
                    <CourseForm
                        initialData={{
                            id,
                            slug,
                            name,
                            description,
                            image,
                            privatePrice,
                            groupPrice,
                            instructorPrice,
                        }}
                        setIsOpen={setIsEditModalOpen}
                    />
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
                    <DropdownMenuItem onClick={() => {
                        sessionStorage.setItem(`activeTab${id}`, "quick_order");
                        router.push(`/content/courses/${slug}`)
                    }}>
                        <PlusSquare className="w-4 h-4 mr-2" />
                        Quick Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDublicate}>
                        <CopyPlus className="w-4 h-4 mr-2" />
                        Dublicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsEditModalOpen(true)
                        setIsOpen(false)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy link
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

export default CoursesActionCell;
