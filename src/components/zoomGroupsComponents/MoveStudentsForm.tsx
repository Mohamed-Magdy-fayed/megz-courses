import { api } from "@/lib/api";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { useToast } from "../ui/use-toast";
import SelectField from "../salesOperation/SelectField";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Spinner from "../Spinner";

type MoveStudentsFormProps = {
    setIsOpen: (val: boolean) => void,
    id: string,
    courseId: string,
}
const MoveStudentsForm: FC<MoveStudentsFormProps> = ({ setIsOpen, id, courseId }) => {
    const [loading, setLoading] = useState(false);
    const [newGroupId, setNewGroupId] = useState<string[]>([]);
    const [studentIds, setStudentIds] = useState<string[]>([]);

    const action = "Continue";

    const { data: groupStudentsData } = api.zoomGroups.getZoomGroupStudents.useQuery({ id });
    const { data: courseZoomGroupsdata } = api.zoomGroups.getzoomGroups.useQuery({ courseId });
    const moveStudentsToAnotherGroupMutation = api.zoomGroups.moveStudentsToAnotherGroup.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

    const onSubmit = () => {
        setLoading(true);
        if (!newGroupId[0]) return toastError("please select a new group")
        moveStudentsToAnotherGroupMutation.mutate({
            originalGroupId: id,
            newGroupId: newGroupId[0],
            studentIds: studentIds,
        }, {
            onSuccess: (data) => {
                trpcUtils.zoomGroups.invalidate()
                    .then(() => {
                        toastSuccess(`the group ${data.updatedOriginalZoomGroup.groupNumber} now has ${data.updatedOriginalZoomGroup.studentIds.length} students!`)
                        toastSuccess(`the group ${data.updatedNewZoomGroup.groupNumber} now has ${data.updatedNewZoomGroup.studentIds.length} students!`)
                        setIsOpen(false);
                        setLoading(false);
                    })
            },
            onError: (error) => {
                toastError(error.message)
                setLoading(false);
            },
        });
    };

    return (
        <div>
            {!courseZoomGroupsdata?.zoomGroups || !groupStudentsData?.gorupStudents ? <Spinner className="mx-auto" /> :
                (
                    <div className="flex flex-col p-4 items-start gap-4 h-full">
                        <SelectField
                            disabled={!courseZoomGroupsdata.zoomGroups || loading}
                            className="col-span-2"
                            values={newGroupId}
                            setValues={setNewGroupId}
                            placeholder={courseZoomGroupsdata.zoomGroups.length === 0 ? "No other groups for this course!" : "Select Group..."}
                            listTitle="New Group"
                            data={courseZoomGroupsdata.zoomGroups
                                .filter(group => group.id !== id)
                                .map(group => ({
                                    active: true,
                                    label: group.groupNumber,
                                    value: group.id,
                                }))}
                        />
                        <SelectField
                            disabled={groupStudentsData.gorupStudents.length === 0 || loading}
                            className="col-span-2"
                            multiSelect
                            values={studentIds}
                            setValues={setStudentIds}
                            placeholder={groupStudentsData.gorupStudents.length === 0 ? "No students in this group!" : "Select Users..."}
                            listTitle="Users"
                            data={groupStudentsData.gorupStudents
                                .map(user => ({
                                    active: true,
                                    label: user.email,
                                    value: user.id,
                                    customLabel: (
                                        <TooltipProvider>
                                            <Typography className="mr-auto">{user.email}</Typography>
                                            <Tooltip delayDuration={10}>
                                                <TooltipTrigger>
                                                    <Link
                                                        href={`/account/${user.id}`}
                                                        target="_blank"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-info"></ExternalLink>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <Typography>
                                                        Go to account
                                                    </Typography>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                }))
                            }
                        />
                    </div>
                )
            }
            <Separator></Separator>
            <div className="flex p-4 justify-end items-center gap-4 h-full">
                <Button
                    type="button"
                    disabled={loading}
                    customeColor="destructive"
                    onClick={() => setIsOpen(false)}
                >
                    <Typography variant={"buttonText"}>Cancel</Typography>
                </Button>
                <Button
                    type="button"
                    disabled={loading}
                    onClick={onSubmit}
                >
                    <Typography variant={"buttonText"}>{action}</Typography>
                </Button>
            </div>
        </div>
    );
};

export default MoveStudentsForm;
