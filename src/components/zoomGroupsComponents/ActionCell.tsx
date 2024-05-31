import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Trash, SearchSlash, MoreVertical, List, Edit, UserPlus, UserMinus, PauseCircle, PlayCircle } from "lucide-react";
import { FC, useState } from "react";
import { AlertModal } from "../modals/AlertModal";
import { api } from "@/lib/api";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import Modal from "../ui/modal";
import SelectField from "../salesOperation/SelectField";
import { GroupStatus } from "@prisma/client";
import { upperFirst } from "lodash";
import ZoomGroupForm from "./Form";
import AddStudentsForm from "./AddStudentsForm";
import RemoveStudentsForm from "./RemoveStudentsForm";
import MoveStudentsForm from "./MoveStudentsForm";
import { UserCog } from "lucide-react";
import PostpondStudentsForm from "./PostpondStudentsForm";
import ResumeStudentsForm from "./ResumeStudentsForm";
import { useRouter } from "next/router";

interface ActionCellProps {
    id: string;
    courseId: string;
    trainerId: string;
    studentIds: string[];
    startDate: Date;
    status: GroupStatus;
    isGroupPage?: boolean;
}

const ActionCell: FC<ActionCellProps> = ({ id, courseId, startDate, trainerId, status, studentIds, isGroupPage }) => {
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<GroupStatus[]>([status]);
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
        onMutate: () => setLoading(true),
        onError: ({ message }) => toastError(message),
        onSettled: () => trpcUtils.zoomGroups.invalidate().then(() => setLoading(false)),
    })
    const deleteMutation = api.zoomGroups.deleteZoomGroup.useMutation()
    const createZoomGroupMutation = api.zoomGroups.createZoomGroup.useMutation({
        onMutate: () => setLoading(true),
        onSuccess: ({ zoomGroup }) => toastSuccess(`group dublicated successfully ${zoomGroup.groupNumber}`),
        onError: ({ message }) => toastError(message),
        onSettled: () => trpcUtils.zoomGroups.invalidate().then(() => setLoading(false)),
    })

    const onChangeStatus = () => {
        editMutation.mutate({
            id,
            groupStatus: newStatus[0],
        }, {
            onSuccess: ({ updatedZoomGroup }) => {
                setChangeStatusOpen(false)
                toastSuccess(`status updated successfully ${updatedZoomGroup.groupStatus}`)
            },
        })
    };

    const onDublicate = () => {
        createZoomGroupMutation.mutate({
            courseId,
            startDate,
            studentIds: [],
            trainerId,
        })
    };

    const onDelete = (callback?: () => void) => {
        setLoading(true);
        deleteMutation.mutate(
            [id],
            {
                onSuccess: () => {
                    trpcUtils.zoomGroups.invalidate()
                        .then(() => {
                            callback?.()
                            toastSuccess("Group deleted");
                            setOpen(false);
                            isGroupPage && router.push(`/groups`)
                        })
                },
                onError: (error) => {
                    toastError(error.message)
                },
                onSettled: () => setLoading(false),
            }
        );
    };

    return (
        <div>
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
                title="Postpond studnets"
                description="move studnets to postponded list"
                isOpen={isPostpondFormOpen}
                onClose={() => setIsPostpondFormOpen(false)}
                children={(
                    <PostpondStudentsForm setIsOpen={setIsPostpondFormOpen} id={id} />
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
                title="Add studnets"
                description="add new students to the group"
                isOpen={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)}
                children={(
                    <AddStudentsForm setIsOpen={setIsAddFormOpen} courseId={courseId} id={id} />
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
                        startDate,
                        studentIds,
                        trainerId,
                    }} />
                )}
            />
            <Modal
                title="Change group status"
                description=""
                isOpen={changeStatusOpen}
                onClose={() => setChangeStatusOpen(false)}
                children={(
                    <div className="flex gap-4 items-center justify-between">
                        <SelectField
                            disabled={loading}
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
                                disabled={loading}
                                onClick={() => setChangeStatusOpen(false)}
                                variant={"outline"}
                                customeColor={"destructiveOutlined"}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                onClick={onChangeStatus}
                                customeColor={"success"}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            />
            <AlertModal
                isOpen={open}
                loading={loading}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
            />
            <DropdownMenu>
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
                    <DropdownMenuItem onClick={() => setChangeStatusOpen(true)}>
                        <List className="w-4 h-4 mr-2" />
                        Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAddFormOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsRemoveFormOpen(true)}>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsMoveFormOpen(true)}>
                        <UserCog className="w-4 h-4 mr-2" />
                        Move students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsPostpondFormOpen(true)}>
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Postpond students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsResumeFormOpen(true)}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Resume students
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditFormOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDublicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        Dublicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ActionCell;
