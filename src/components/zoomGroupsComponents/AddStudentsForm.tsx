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

type AddStudentsFormProps = {
    setIsOpen: (val: boolean) => void,
    id: string,
    courseId: string,
    lvlId: string,
}
const AddStudentsForm: FC<AddStudentsFormProps> = ({ setIsOpen, id, courseId, lvlId }) => {
    const [loading, setLoading] = useState(false);
    const [userIds, setUserIds] = useState<string[]>([]);

    const action = "Continue";

    const { data: courseWaitingListData } = api.courses.getWaitingList.useQuery({ id: courseId });
    const addToZoomGroupMutation = api.zoomGroups.addStudentsToZoomGroup.useMutation();
    const trpcUtils = api.useUtils();
    const { toastError, toastSuccess } = useToast()

    const onSubmit = () => {
        setLoading(true);
        addToZoomGroupMutation.mutate({
            id,
            studentIds: userIds
        }, {
            onSuccess: (data) => {
                trpcUtils.zoomGroups.invalidate()
                    .then(() => {
                        toastSuccess(`the group now has ${data.updatedZoomGroup.studentIds.length} students!`)
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
            <div className="flex flex-col p-4 items-start gap-4 h-full">
                {!courseWaitingListData?.watingUsers ? <Spinner className="mx-auto" /> :
                    <SelectField
                        disabled={courseWaitingListData.watingUsers.length === 0}
                        className="col-span-2"
                        multiSelect
                        values={userIds}
                        setValues={setUserIds}
                        placeholder={courseWaitingListData.watingUsers.length === 0 ? "No students waiting for this course!" : "Select Users..."}
                        listTitle="Users"
                        data={courseWaitingListData.watingUsers
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
                }
            </div>
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

export default AddStudentsForm;
