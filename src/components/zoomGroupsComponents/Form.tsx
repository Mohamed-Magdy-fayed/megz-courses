import { api } from "@/lib/api";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { useToast } from "../ui/use-toast";
import SelectField from "../salesOperation/SelectField";
import Spinner from "../Spinner";
import { DatePicker } from "../ui/DatePicker";
import { getWaitingList } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface ZoomGroupFormProps {
    setIsOpen: (val: boolean) => void;
    initialData?: {
        id: string;
        courseId: string,
        startDate: Date,
        studentIds: string[],
        trainerId: string,
    };
}
const ZoomGroupForm: FC<ZoomGroupFormProps> = ({ setIsOpen, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [courseId, setCourseId] = useState<string[]>(initialData ? [initialData.courseId] : []);
    const [userIds, setUserIds] = useState<string[]>(initialData ? initialData.studentIds : []);
    const [trainerId, setTrainerId] = useState<string[]>(initialData ? [initialData.trainerId] : []);
    const [date, setDate] = useState<Date | undefined>(initialData ? initialData.startDate : new Date());

    const action = initialData ? "Edit" : "Create";

    const { data: trainersData } = api.trainers.getTrainers.useQuery();
    const { data: coursesData } = api.courses.getAll.useQuery();
    const createZoomGroupMutation = api.zoomGroups.createZoomGroup.useMutation();
    const editZoomGroupMutation = api.zoomGroups.editZoomGroup.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

    const onCreate = () => {
        setLoading(true);
        createZoomGroupMutation.mutate({
            courseId: courseId[0]!,
            startDate: date!,
            studentIds: userIds,
            trainerId: trainerId[0]!,
        }, {
            onSuccess: (data) => {
                trpcUtils.zoomGroups.invalidate()
                    .then(() => {
                        toastSuccess(`Group ${data.zoomGroup.groupNumber} created successfully!`)
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

    const onEdit = () => {
        setLoading(true);
        editZoomGroupMutation.mutate({
            id: initialData?.id!,
            startDate: date!,
            trainerId: trainerId[0]!,
        }, {
            onSuccess: (data) => {
                trpcUtils.zoomGroups.invalidate()
                    .then(() => {
                        toastSuccess(`Group ${data.updatedZoomGroup.groupNumber} updated successfully!`)
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
            {!trainersData || !coursesData ? <Spinner className="w-fit mx-auto" /> : (
                <div className="flex flex-col p-4 items-start gap-4 h-full">
                    <SelectField
                        values={trainerId}
                        setValues={setTrainerId}
                        placeholder="Select Trainer..."
                        listTitle="Trainers"
                        data={trainersData.trainers.map(trainer => ({ active: trainer.groups.length < 10, label: trainer.user.email, value: trainer.id }))}
                    />
                    {initialData ? (
                        <Typography>{coursesData.courses.find(({ id }) => id === initialData.courseId)?.name}</Typography>
                    ) : (
                        <SelectField
                            values={courseId}
                            setValues={setCourseId}
                            placeholder="Select Course..."
                            listTitle="Courses"
                            data={coursesData.courses.map(course => ({
                                active: getWaitingList(course) >= 5,
                                label: course.name,
                                value: course.id,
                                customLabel: (
                                    <div className="flex items-center justify-between w-full">
                                        <Typography>{course.name}</Typography>
                                        <Typography className="text-xs text-muted">Waiting: {getWaitingList(course)}</Typography>
                                    </div>
                                )
                            }))}
                        />
                    )}
                    {initialData ? (
                        <div className="flex flex-col gap-2" >
                            {(coursesData.courses.find(course => course.id === initialData.courseId)?.orders || [])
                                .filter((order, index, self) => (index === self.findIndex(({ userId }) => order.user.id === userId))
                                    && order.user.courseStatus.some(state => state.courseId === initialData.courseId))
                                .map(({ user: { email }, userId }) => (
                                    <TooltipProvider>
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <Typography className="mr-auto">{email}</Typography>
                                            <Tooltip delayDuration={10}>
                                                <TooltipTrigger>
                                                    <Link
                                                        href={`/account/${userId}`}
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
                                        </div>
                                    </TooltipProvider>
                                ))}
                        </div>
                    ) : (
                        <SelectField
                            className="col-span-2"
                            multiSelect
                            values={userIds}
                            setValues={setUserIds}
                            placeholder="Select Users..."
                            listTitle="Users"
                            data={(coursesData.courses.find(course => course.id === courseId[0])?.orders || [])
                                .filter((order, index, self) => index === self.findIndex(({ userId }) => order.user.id === userId))
                                .map(order => ({
                                    active: order.user.courseStatus.find(status => status.courseId === courseId[0])?.state === "waiting",
                                    label: order.user.email,
                                    value: order.user.id,
                                    customLabel: (
                                        <TooltipProvider>
                                            <Typography className="mr-auto">{order.user.email}</Typography>
                                            <Tooltip delayDuration={10}>
                                                <TooltipTrigger>
                                                    <Link
                                                        href={`/account/${order.userId}`}
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
                    )}
                    <DatePicker
                        className="row-start-2"
                        date={date}
                        setDate={setDate}
                    />
                </div>
            )}
            <Separator></Separator>
            <div className="flex p-4 justify-end items-center gap-4 h-full">
                <Button
                    disabled={loading}
                    customeColor="destructive"
                    onClick={() => setIsOpen(false)}
                    type="button"
                >
                    <Typography variant={"buttonText"}>Cancel</Typography>
                </Button>
                <Button
                    disabled={loading}
                    customeColor="accent"
                >
                    <Typography variant={"buttonText"}>Reset</Typography>
                </Button>
                <Button disabled={loading} onClick={initialData ? onEdit : onCreate}>
                    <Typography variant={"buttonText"}>{action}</Typography>
                </Button>
            </div>
        </div >
    );
};

export default ZoomGroupForm;
