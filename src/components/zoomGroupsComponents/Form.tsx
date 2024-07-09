import { api } from "@/lib/api";
import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { useToast } from "../ui/use-toast";
import SelectField from "../salesOperation/SelectField";
import Spinner from "../Spinner";
import { DatePicker } from "../ui/DatePicker";
import { CourseType, getLevelWaitingList, getWaitingList } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CourseLevels } from "@prisma/client";

interface ZoomGroupFormProps {
    setIsOpen: (val: boolean) => void;
    initialData?: {
        id: string;
        courseId: string,
        courseLevel: CourseLevels,
        startDate: Date,
        studentIds: string[],
        trainerId: string,
    };
}
const ZoomGroupForm: FC<ZoomGroupFormProps> = ({ setIsOpen, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<CourseType>();
    const [courseId, setCourseId] = useState<string[]>(initialData ? [initialData.courseId] : []);
    const [courseLevel, setCourseLevel] = useState<CourseLevels[]>(initialData ? [initialData.courseLevel] : []);
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
            courseLevel: courseLevel[0]!,
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

    const totalWaitingUsers = useMemo(
        () => coursesData?.courses.map(course => {
            const userIds = new Set();
            course.orders.forEach(order => {
                if (order.user.courseStatus.some(({ courseId, state }) => courseId === course.id && state === "waiting")) {
                    userIds.add(order.user.id);
                }
            });
            return userIds.size;
        }).reduce((a, b) => a + b, 0),
        [coursesData?.courses]
    )

    useEffect(() => {
        setCourse(coursesData?.courses.find(course => course.id === courseId[0]))
    }, [courseId])

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
                        <Typography>{coursesData.courses.find(({ id }) => id === initialData.courseId)?.name} - {courseLevel}</Typography>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <SelectField
                                values={courseId}
                                setValues={setCourseId}
                                placeholder="Select Course..."
                                listTitle={(
                                    <div className="flex items-center justify-between w-full">
                                        <Typography>Courses</Typography>
                                        <Typography className="text-xs text-muted">Total waiting: {totalWaitingUsers}</Typography>
                                    </div>
                                )}
                                data={coursesData.courses.map(course => ({
                                    active: getWaitingList(course) >= 1,
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
                            {course && (
                                <SelectField
                                    values={courseLevel}
                                    setValues={setCourseLevel}
                                    placeholder="Select Level..."
                                    listTitle={(
                                        <div className="flex items-center justify-between w-full">
                                            <Typography>Levels</Typography>
                                            <Typography className="text-xs text-muted">Total waiting for level: {totalWaitingUsers}</Typography>
                                        </div>
                                    )}
                                    data={course.levels.map(level => ({
                                        active: getLevelWaitingList(course, level) >= 1,
                                        label: level,
                                        value: level,
                                        customLabel: (
                                            <div className="flex items-center justify-between w-full space-x-4">
                                                <Typography>{level}</Typography>
                                                <Typography className="text-xs text-muted">Waiting: {getLevelWaitingList(course, level)}</Typography>
                                            </div>
                                        )
                                    }))}
                                />
                            )}
                        </div>
                    )}
                    {initialData ? (
                        <div className="flex flex-col gap-2" >
                            {(coursesData.courses.find(course => course.id === initialData.courseId)?.orders || [])
                                .filter((order, index, self) => (index === self.findIndex(({ userId }) => order.user.id === userId))
                                    && order.user.courseStatus.some(state => state.courseId === initialData.courseId))
                                .map(({ user: { email }, userId }) => (
                                    <TooltipProvider key={userId}>
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
                            data={(course?.orders || [])
                                .filter((order, index, self) => {
                                    const courseStatus = order.user.courseStatus.find(status => status.courseId === courseId[0])

                                    return index === self.findIndex(({ userId }) => order.user.id === userId) && courseStatus?.level === courseLevel[0]
                                })
                                .map(order => {
                                    const courseStatus = order.user.courseStatus.find(status => status.courseId === courseId[0])
                                    const isPrivate = order.courseTypes.find(type => type.id === courseId[0])?.isPrivate

                                    return ({
                                        active: courseStatus?.state === "waiting",
                                        label: order.user.name,
                                        value: order.user.id,
                                        customLabel: (
                                            <TooltipProvider>
                                                <Typography className="mr-auto">{order.user.name}</Typography>
                                                <Typography className="text-xs">{isPrivate ? "Private" : "Group"}</Typography>
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
                                    })
                                })
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
