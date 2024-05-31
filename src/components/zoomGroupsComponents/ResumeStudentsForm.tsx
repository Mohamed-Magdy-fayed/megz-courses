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

type ResumeStudentsFormProps = {
    setIsOpen: (val: boolean) => void,
    id: string,
    courseId: string,
}
const ResumeStudentsForm: FC<ResumeStudentsFormProps> = ({ setIsOpen, id, courseId }) => {
    const [loading, setLoading] = useState(false);
    const [userIds, setUserIds] = useState<string[]>([]);

    const action = "Continue";

    const { data: coursePostpondedListData } = api.courses.getUsersWithStatus.useQuery({ id: courseId, status: "postponded" });
    const moveStudentsToWaitingListMutation = api.zoomGroups.moveStudentsToWaitingList.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

    const onSubmit = () => {
        setLoading(true);
        moveStudentsToWaitingListMutation.mutate({
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
                {!coursePostpondedListData?.usersWithStatus ? <Spinner className="mx-auto" /> :
                    <SelectField
                        disabled={coursePostpondedListData.usersWithStatus.length === 0 || loading}
                        className="col-span-2"
                        multiSelect
                        values={userIds}
                        setValues={setUserIds}
                        placeholder={coursePostpondedListData.usersWithStatus.length === 0 ? "No students in postpond list!" : "Select Users..."}
                        listTitle="Users"
                        data={coursePostpondedListData.usersWithStatus.map(user => ({
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

export default ResumeStudentsForm;
