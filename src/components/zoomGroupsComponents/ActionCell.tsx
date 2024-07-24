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
import { useToast } from "../ui/use-toast";
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
import ModalInDropdownMenu from "../ui/modal-in-dropdown-menu";

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
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
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
        onMutate: () => setLoading(true),
        onError: ({ message }) => toastError(message),
        onSettled: () => trpcUtils.zoomGroups.invalidate().then(() => setLoading(false)),
    })
    const deleteMutation = api.zoomGroups.deleteZoomGroup.useMutation()

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
                    <ModalInDropdownMenu
                        title="Change group status"
                        description=""
                        isOpen={changeStatusOpen}
                        onOpen={() => setChangeStatusOpen(true)}
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
                        itemChildren={
                            <>
                                <List className="w-4 h-4 mr-2" />
                                Change Status
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        title="Add studnets"
                        description="add new students to the group"
                        isOpen={isAddFormOpen}
                        onOpen={() => setIsAddFormOpen(true)}
                        onClose={() => setIsAddFormOpen(false)}
                        children={(
                            <AddStudentsForm setIsOpen={setIsAddFormOpen} courseId={courseId} id={id} />
                        )}
                        itemChildren={
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add students
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        title="Move studnets"
                        description="move studnets to waiting list"
                        isOpen={isMoveFormOpen}
                        onOpen={() => setIsMoveFormOpen(true)}
                        onClose={() => setIsMoveFormOpen(false)}
                        children={(
                            <MoveStudentsForm setIsOpen={setIsMoveFormOpen} courseId={courseId} id={id} />
                        )}
                        itemChildren={
                            <>
                                <UserCog className="w-4 h-4 mr-2" />
                                Move students
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        title="Remove studnets"
                        description="move studnets to waiting list"
                        isOpen={isRemoveFormOpen}
                        onOpen={() => setIsRemoveFormOpen(true)}
                        onClose={() => setIsRemoveFormOpen(false)}
                        children={(
                            <RemoveStudentsForm setIsOpen={setIsRemoveFormOpen} courseId={courseId} id={id} studentIds={studentIds} />
                        )}
                        itemChildren={
                            <>
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove students
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        title="Postpond studnets"
                        description="move studnets to postponded list"
                        isOpen={isPostpondFormOpen}
                        onOpen={() => setIsPostpondFormOpen(true)}
                        onClose={() => setIsPostpondFormOpen(false)}
                        children={(
                            <PostpondStudentsForm setIsOpen={setIsPostpondFormOpen} id={id} />
                        )}
                        itemChildren={
                            <>
                                <PauseCircle className="w-4 h-4 mr-2" />
                                Postpond students
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        title="Resume studnets"
                        description="move studnets to back to waiting list"
                        isOpen={isResumeFormOpen}
                        onOpen={() => setIsResumeFormOpen(true)}
                        onClose={() => setIsResumeFormOpen(false)}
                        children={(
                            <ResumeStudentsForm setIsOpen={setIsResumeFormOpen} id={id} courseId={courseId} />
                        )}
                        itemChildren={
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Resume students
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        title="Edit group"
                        description="Update group details"
                        isOpen={isEditFormOpen}
                        onOpen={() => setIsEditFormOpen(true)}
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
                        itemChildren={
                            <>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </>
                        }
                    />
                    <ModalInDropdownMenu
                        isOpen={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        title="Delete"
                        description="This action can't be undone!"
                        children={
                            <div className="flex w-full items-center justify-end space-x-2 pt-6">
                                <Button disabled={loading} variant={"outline"} customeColor={"mutedOutlined"} onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button disabled={loading} customeColor="destructive" onClick={() => onDelete()}>
                                    Continue
                                </Button>
                            </div>
                        }
                        itemChildren={
                            <>
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                            </>
                        }
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ActionCell;
