import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, List, MoreVertical, SearchSlash, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { AlertModal } from "@/components/modals/AlertModal";
import { useState } from "react";
import { api } from "@/lib/api";
import { GroupStatus } from "@prisma/client";
import Modal from "@/components/ui/modal";
import ZoomGroupForm from "@/components/zoomGroupsComponents/Form";
import SelectField from "@/components/salesOperation/SelectField";
import { upperFirst } from "lodash";
import { CourseRow } from "@/components/contentComponents/courseGroups/CourseGroupsColumn";

const CourseGroupsActionCell: React.FC<CourseRow> = ({ id, courseId, courseLevel, startDate, groupStatus, studentIds, trainerId }) => {
    const { toastError, toastSuccess } = useToast();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<GroupStatus[]>([groupStatus]);
    const [changeStatusOpen, setChangeStatusOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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
        <>
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
                    <DropdownMenuItem>
                        <Link className="flex gap-2" href={`/groups/${id}`} target="_blank">
                            <SearchSlash className="w-4 h-4 mr-2" />
                            View
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChangeStatusOpen(true)}>
                        <List className="w-4 h-4 mr-2" />
                        Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditFormOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export default CourseGroupsActionCell;
