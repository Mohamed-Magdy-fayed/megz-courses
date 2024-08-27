import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Trash, SearchSlash, MoreVertical, List, Edit, UserPlus, UserMinus, PauseCircle, PlayCircle } from "lucide-react";
import { FC, useState } from "react";
import { api } from "@/lib/api";
import { toastType, useToast } from "../ui/use-toast";
import Link from "next/link";
import SelectField from "../salesOperation/SelectField";
import { CourseLevel, GroupStatus } from "@prisma/client";
import { upperFirst } from "lodash";
import ZoomGroupForm from "./Form";
import AddStudentsForm from "./AddStudentsForm";
import RemoveStudentsForm from "./RemoveStudentsForm";
import MoveStudentsForm from "./MoveStudentsForm";
import { UserCog } from "lucide-react";
import PostpondStudentsForm from "./PostpondStudentsForm";
import ResumeStudentsForm from "./ResumeStudentsForm";
import { useRouter } from "next/router";
import Modal from "@/components/ui/modal";
import { AlertModal } from "@/components/modals/AlertModal";

interface ActionCellProps {
    id: string;
    courseId: string;
    courseLevel: CourseLevel;
    trainerId: string;
    studentIds: string[];
    startDate: Date;
    status: GroupStatus;
    isGroupPage?: boolean;
}

const ActionCell: FC<ActionCellProps> = ({ id, courseId, courseLevel, startDate, trainerId, status, studentIds, isGroupPage }) => {
    const { toast } = useToast();

    const [loadingToast, setLoadingToast] = useState<toastType>()
    const [open, setOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<GroupStatus[]>([status]);
    const [isOpen, setIsOpen] = useState(false);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isRemoveFormOpen, setIsRemoveFormOpen] = useState(false);
    const [isMoveFormOpen, setIsMoveFormOpen] = useState(false);
    const [isPostpondFormOpen, setIsPostpondFormOpen] = useState(false);
    const [isResumeFormOpen, setIsResumeFormOpen] = useState(false);
    const [changeStatusOpen, setChangeStatusOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    const router = useRouter()
    const trpcUtils = api.useContext()
    const editMutation = api.zoomGroups.editZoomGroup.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 3000,
            variant: "info",
        })),
        onSuccess: ({ updatedZoomGroup }) => trpcUtils.zoomGroups.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Group ${updatedZoomGroup.groupNumber} updated successfully`,
                    variant: "success",
                })
                setIsOpen(false)
            }),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        }
    })
    const deleteMutation = api.zoomGroups.deleteZoomGroup.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 3000,
            variant: "info",
        })),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive",
        }),
        onSettled: () => {
            loadingToast?.dismissAfter()
            setLoadingToast(undefined)
        }
    })

    const onChangeStatus = () => {
        editMutation.mutate({
            id,
            groupStatus: newStatus[0],
        })
    };

    const onDelete = (callback?: () => void) => {
        deleteMutation.mutate(
            [id],
            {
                onSuccess: () => {
                    trpcUtils.zoomGroups.invalidate()
                        .then(() => {
                            callback?.()
                            loadingToast?.update({
                                id: loadingToast.id,
                                title: "Success",
                                description: `Group deleted successfully`,
                                variant: "success",
                            })
                            setOpen(false);
                            isGroupPage && router.push(`/groups`)
                        })
                },
            }
        );
    };

    return (
        <div>
            <Modal
                title="Add studnets"
                description="add new students to the group"
                isOpen={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)}
                children={(
                    <AddStudentsForm setIsOpen={setIsAddFormOpen} courseId={courseId} lvlId={courseLevel.id} id={id} />
                )}
            />
            <Modal
                title="Move studnets"
                description="move studnets to waiting list"
                isOpen={isMoveFormOpen}
                onClose={() => setIsMoveFormOpen(false)}
                children={(
                    <MoveStudentsForm setIsOpen={setIsMoveFormOpen} courseId={courseId} id={id} />
                )}
            />
            <Modal
                title="Remove studnets"
                description="move studnets to waiting list"
                isOpen={isRemoveFormOpen}
                onClose={() => setIsRemoveFormOpen(false)}
                children={(
                    <RemoveStudentsForm setIsOpen={setIsRemoveFormOpen} courseId={courseId} id={id} studentIds={studentIds} />
                )}
            />
            <Modal
                title="Postpond studnets"
                description="move studnets to postponded list"
                isOpen={isPostpondFormOpen}
                onClose={() => setIsPostpondFormOpen(false)}
                children={(
                    <PostpondStudentsForm setIsOpen={setIsPostpondFormOpen} id={id} />
                )}
            />
            <Modal
                title="Resume studnets"
                description="move studnets to back to waiting list"
                isOpen={isResumeFormOpen}
                onClose={() => setIsResumeFormOpen(false)}
                children={(
                    <ResumeStudentsForm setIsOpen={setIsResumeFormOpen} id={id} courseId={courseId} />
                )}
            />
            <Modal
                title="Edit group"
                description="Update group details"
                isOpen={isEditFormOpen}
                onClose={() => setIsEditFormOpen(false)}
                children={(
                    <ZoomGroupForm setIsOpen={setIsEditFormOpen} initialData={{
                        id,
                        courseId,
                        courseLevel,
                        startDate,
                        studentIds,
                        trainerId,
                    }} />
                )}
            />
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                loading={!!loadingToast}
                onConfirm={onDelete}
            />
            <Modal
                title="Change group status"
                description=""
                isOpen={changeStatusOpen}
                onClose={() => setChangeStatusOpen(false)}
                children={(
                    <div className="flex gap-4 items-center justify-between">
                        <SelectField
                            disabled={!!loadingToast}
                            data={Object.values(GroupStatus).map(groupstatus => ({
                                active: groupstatus !== status,
                                label: upperFirst(groupstatus),
                                value: groupstatus,
                            }))}
                            listTitle="Statuses"
                            placeholder={upperFirst(status)}
                            setValues={setNewStatus}
                            values={newStatus}
                            disableSearch
                        />
                        <div className="flex items-center gap-4">
                            <Button
                                disabled={!!loadingToast}
                                onClick={() => setChangeStatusOpen(false)}
                                variant={"outline"}
                                customeColor={"destructiveOutlined"}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!!loadingToast}
                                onClick={onChangeStatus}
                                customeColor={"success"}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            />
            <DropdownMenu defaultOpen={false} onOpenChange={(val) => setIsOpen(val)} open={isOpen}>
                <DropdownMenuTrigger asChild>
                    <Button customeColor="mutedIcon" variant={"icon"} >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {isGroupPage ? (
                        null
                    ) : (
                        <DropdownMenuItem>
                            <Link className="flex gap-2" href={`/groups/${id}`} target="_blank">
                                <SearchSlash className="w-4 h-4 mr-2" />
                                View
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsAddFormOpen(true)
                    }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsMoveFormOpen(true)
                    }}>
                        <UserCog className="w-4 h-4 mr-2" />
                        Move students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsRemoveFormOpen(true)
                    }}>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsPostpondFormOpen(true)
                    }}>
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Postpond students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsResumeFormOpen(true)
                    }}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Resume students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setIsEditFormOpen(true)
                    }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setOpen(true)
                    }}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        setIsOpen(false)
                        setChangeStatusOpen(true)
                    }}>
                        <List className="w-4 h-4 mr-2" />
                        Change Status
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ActionCell;
