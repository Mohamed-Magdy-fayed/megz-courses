import { api } from "@/lib/api";
import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "../ui/Typoghraphy";
import { toastType, useToast } from "../ui/use-toast";
import SelectField from "../salesOperation/SelectField";
import Spinner from "../Spinner";
import { DatePicker } from "../ui/DatePicker";
import { CourseType, getLevelWaitingList, getWaitingList } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { format } from "date-fns";

interface ZoomGroupFormProps {
    setIsOpen: (val: boolean) => void;
    initialData?: {
        id: string;
        courseId: string,
        courseLevel: {
            id: string;
            name: string;
            slug: string;
        },
        startDate: Date,
        studentIds: string[],
        trainerId: string,
    };
}
const ZoomGroupForm: FC<ZoomGroupFormProps> = ({ setIsOpen, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<CourseType>();
    const [courseId, setCourseId] = useState<string[]>(initialData ? [initialData.courseId] : []);
    const [courseLevelId, setCourseLevelId] = useState<string[]>(initialData ? [initialData.courseLevel.id] : []);
    const [userIds, setUserIds] = useState<string[]>(initialData ? initialData.studentIds : []);
    const [trainerId, setTrainerId] = useState<string[]>(initialData ? [initialData.trainerId] : []);
    const [date, setDate] = useState<Date | undefined>(initialData ? initialData.startDate : new Date());
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast } = useToast()

    const action = initialData ? "Edit" : "Create";

    const { data: trainersData } = api.trainers.getTrainers.useQuery();
    const { data: coursesData } = api.courses.getAll.useQuery();
    const availableZoomClientMutation = api.zoomAccounts.getAvailableZoomClient.useMutation({
        onMutate: () => {
            setLoading(true)
            setLoadingToast(toast({
                title: "Loading...",
                variant: "info",
                description: (
                    <Spinner className="h-4 w-4" />
                ),
                duration: 30000,
            }))
        },
        onSuccess: ({ zoomClient }) => {
            if (!zoomClient?.id) {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Error",
                    description: "No available Zoom Accounts at the selected time!",
                    variant: "destructive",
                })
                setLoading(false)
                loadingToast?.dismissAfter()
                setLoadingToast(undefined)
                return
            }
            refreshTokenMutation.mutate({ zoomClientId: zoomClient.id }, {
                onSuccess: ({ updatedZoomClient }) => {
                    createMeetingMutation.mutate({
                        courseId: courseId[0]!,
                        trainerId: trainerId[0]!,
                        startDate: date!,
                        courseLevelId: courseLevelId[0]!,
                        zoomClientId: updatedZoomClient.id!,
                    }, {
                        onSuccess: ({ meetingNumber, meetingPassword, groupNumber, meetingLink }) => {
                            createZoomGroupMutation.mutate({
                                groupNumber,
                                meetingNumber,
                                meetingPassword,
                                meetingLink,
                                zoomClientId: updatedZoomClient.id!,
                                courseId: courseId[0]!,
                                trainerId: trainerId[0]!,
                                courseLevelId: courseLevelId[0]!,
                                startDate: date!,
                                studentIds: userIds,
                            }, {
                                onSuccess: (data) => {
                                    data.zoomGroup.students.forEach(student => {
                                        sendWhatsAppMessage({
                                            toNumber: "201123862218",
                                            textBody: `Hi ${student.name},
                                            \n\nCongratulations, you have been added to a group to start your course.
                                            \nGroup start date: ${format(data.zoomGroup.startDate, "PPPp")}
                                            \nGroup days: ${format(data.zoomGroup.zoomSessions[0]?.sessionDate!, "iiii")} and ${format(data.zoomGroup.zoomSessions[1]?.sessionDate!, "iiii")}
                                            \nGroup Time: ${format(data.zoomGroup.startDate, "pp")}
                                            \nGroup Teacher: ${data.zoomGroup.trainer?.user.name}
                                            \n\nOur Team.`,
                                        })
                                    })
                                    trpcUtils.zoomGroups.invalidate()
                                        .then(() => {
                                            loadingToast?.update({
                                                id: loadingToast.id,
                                                title: "Success",
                                                description: `Group ${data.zoomGroup.groupNumber} created successfully!`,
                                                variant: "success",
                                                duration: 2000,
                                            })
                                            setIsOpen(false);
                                            setLoading(false);
                                        })
                                },
                                onError: ({ message }) => {
                                    loadingToast?.update({
                                        id: loadingToast.id,
                                        title: "Error",
                                        description: message,
                                        duration: 2000,
                                        variant: "destructive",
                                    })
                                    setLoading(false);
                                },
                            })
                        },
                        onError: ({ message }) => {
                            loadingToast?.update({
                                id: loadingToast.id,
                                title: "Error",
                                description: message,
                                duration: 2000,
                                variant: "destructive",
                            })
                            setLoading(false)
                        },
                    })
                },
            })
        },
    });
    const refreshTokenMutation = api.zoomMeetings.refreshToken.useMutation();
    const createMeetingMutation = api.zoomMeetings.createMeeting.useMutation();
    const createZoomGroupMutation = api.zoomGroups.createZoomGroup.useMutation();
    const editZoomGroupMutation = api.zoomGroups.editZoomGroup.useMutation();
    const trpcUtils = api.useContext();
    const { toastError, toastSuccess } = useToast()

    const onCreate = () => {
        if (!date) return toastError("Please select the start date!")
        availableZoomClientMutation.mutate({ startDate: date })
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
                if (order.user.courseStatus.some(({ courseId, status }) => courseId === course.id && status === "waiting")) {
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
                        <Typography>{coursesData.courses.find(({ id }) => id === initialData.courseId)?.name} - {initialData.courseLevel.name}</Typography>
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
                                    values={courseLevelId}
                                    setValues={setCourseLevelId}
                                    placeholder="Select Level..."
                                    listTitle={(
                                        <div className="flex items-center justify-between w-full">
                                            <Typography>Levels</Typography>
                                            <Typography className="text-xs text-muted">Total waiting for level: {totalWaitingUsers}</Typography>
                                        </div>
                                    )}
                                    data={course.levels.map(level => ({
                                        active: getLevelWaitingList(course, level.id) >= 1,
                                        label: level.name,
                                        value: level.id,
                                        customLabel: (
                                            <div className="flex items-center justify-between w-full space-x-4">
                                                <Typography>{level.name}</Typography>
                                                <Typography className="text-xs text-muted">Waiting: {getLevelWaitingList(course, level.id)}</Typography>
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

                                    return index === self.findIndex(({ userId }) => order.user.id === userId) && courseStatus?.courseLevelId === courseLevelId[0]
                                })
                                .map(order => {
                                    const courseStatus = order.user.courseStatus.find(status => status.courseId === courseId[0])
                                    const isPrivate = order.courseType.isPrivate

                                    return ({
                                        active: courseStatus?.status === "waiting",
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
