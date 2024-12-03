import { api } from "@/lib/api";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { useToast } from "../ui/use-toast";
import SelectField from "../ui/SelectField";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Spinner from "../Spinner";

type ResumeStudentsFormProps = {
    setIsOpen: (val: boolean) => void,
}
const ResumeStudentsForm: FC<ResumeStudentsFormProps> = ({ setIsOpen }) => {
    const [loading, setLoading] = useState(false);
    const [userIds, setUserIds] = useState<string[]>([]);

    const action = "Continue";

    const { data: postpondedListData } = api.waitingList.queryFullList.useQuery({ status: "Postponded" });
    const resumeStudentsMutation = api.zoomGroups.resumeStudents.useMutation();
    const trpcUtils = api.useUtils();
    const { toastError, toastSuccess } = useToast()

    const onSubmit = () => {
        setLoading(true);
        resumeStudentsMutation.mutate({
            studentIds: userIds
        }, {
            onSuccess: (data) => {
                trpcUtils.zoomGroups.invalidate()
                    .then(() => {
                        toastSuccess(`${data.updatedCourseStatus.count} students has beed added to Waiting list!`)
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
                {!postpondedListData?.fullList ? <Spinner className="mx-auto" /> :
                    <SelectField
                        disabled={postpondedListData?.fullList.length === 0 || loading}
                        className="col-span-2"
                        multiSelect
                        values={userIds}
                        setValues={setUserIds}
                        placeholder={postpondedListData?.fullList.length === 0 ? "No students in postpond list!" : "Select Users..."}
                        listTitle="Users"
                        data={postpondedListData?.fullList.map(status => ({
                            Active: true,
                            label: status.user.name,
                            value: status.user.id,
                            customLabel: (
                                <TooltipProvider>
                                    <Typography className="mr-auto">{status.user.name}</Typography>
                                    <Tooltip delayDuration={10}>
                                        <TooltipTrigger>
                                            <Link
                                                href={`/account/${status.user.id}`}
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
