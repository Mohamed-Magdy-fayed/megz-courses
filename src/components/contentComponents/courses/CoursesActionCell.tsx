import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, Edit, MoreVertical, Trash } from "lucide-react";
import { ToasterToast, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useState } from "react";
import Spinner from "@/components/Spinner";
import Modal from "@/components/ui/modal";
import CourseForm from "./CourseForm";
import { Course } from "@prisma/client";
import ModalInDropdownMenu from "@/components/ui/modal-in-dropdown-menu";

interface CellActionProps {
    id: string;
}

const CoursesActionCell: React.FC<CellActionProps> = ({ id }) => {
    const { toastInfo, toast } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const onCopy = () => {
        navigator.clipboard.writeText(`${window.location.host}/courses/${id}`);
        toastInfo("User link copied to the clipboard");
    };

    const [loadingToast, setLoadingToast] = useState<{
        id: string;
        dismiss: () => void;
        update: (props: ToasterToast) => void;
    }>()
    const trpcUtils = api.useContext()
    const courseQuery = api.courses.getById.useQuery({ id })
    const dublicateMutation = api.courses.dublicateCourse.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 30000,
            }))
        },
        onSuccess: ({ course }) => trpcUtils.courses.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `${course.name} dublicated successfully`,
            title: "Success",
            duration: 2000,
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
            duration: 2000,
        }),
    })
    const deleteMutation = api.courses.deleteCourses.useMutation({
        onMutate: () => {
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 30000,
            }))
        },
        onSuccess: ({ deletedCourses }) => trpcUtils.courses.invalidate().then(() => loadingToast?.update({
            id: loadingToast.id,
            variant: "success",
            description: `${deletedCourses.count} courses deleted`,
            title: "Success",
            duration: 2000,
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            variant: "destructive",
            description: message,
            title: "Error",
            duration: 2000,
        }),
    })
    const onDelete = () => {
        deleteMutation.mutate([id])
    };

    const onDublicate = () => {
        dublicateMutation.mutate({ id })
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onDublicate}>
                        <CopyPlus className="w-4 h-4 mr-2" />
                        Dublicate
                    </DropdownMenuItem>
                    <ModalInDropdownMenu
                        title="Edit Course"
                        description="Update the course details"
                        isOpen={isEditModalOpen}
                        onOpen={() => setIsEditModalOpen(true)}
                        onClose={() => setIsEditModalOpen(false)}
                        children={courseQuery.data?.course && <CourseForm initialData={courseQuery.data.course} setIsOpen={setIsEditModalOpen} />}
                        itemChildren={
                            <>
                                <Edit className="w-4 h-4 mr-2" />
                                edit
                            </>
                        }
                    />
                    <DropdownMenuItem onClick={onCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy user link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CoursesActionCell;
