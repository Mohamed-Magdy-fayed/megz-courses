import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, ChevronDownIcon, PlusSquare, Trash } from "lucide-react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";
import CourseForm from "./CourseForm";
import Modal from "@/components/ui/modal";
import { env } from "@/env.mjs";
import { AlertModal } from "@/components/general/modals/AlertModal";
import { createMutationOptions } from "@/lib/mutationsHelper";
import CreateOrderModal from "@/components/admin/salesManagement/modals/CreateOrderModal";

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
    const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(`${env.NEXT_PUBLIC_NEXTAUTH_URL}content/courses/${slug}`);
        toastInfo("Course link copied to the clipboard");
    };

    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useUtils()
    const deleteMutation = api.courses.deleteCourses.useMutation(
        createMutationOptions({
            trpcUtils,
            loadingToast,
            setLoadingToast,
            toast,
            successMessageFormatter: ({ deletedCourses }) => {
                setIsDeleteOpen(false)
                return `${deletedCourses.count} courses deleted`
            },
            loadingMessage: "Deleting...",
        })
    )

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
            <CreateOrderModal isOpen={isAddOrderOpen} setIsOpen={setIsAddOrderOpen} />
            <DropdownMenu open={isOpen} onOpenChange={(val) => setIsOpen(val)}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedOutlined" variant={"outline"} className="w-full h-fit p-0" >
                        <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsAddOrderOpen(true)
                    }}>
                        <PlusSquare className="w-4 h-4 mr-2" />
                        Quick Order
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
