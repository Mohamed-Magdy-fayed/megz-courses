import { api } from "@/lib/api";
import { FC, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import SelectField from "@/components/ui/SelectField";
import Spinner from "@/components/ui/Spinner";
import { CourseType, getLevelWaitingList, getWaitingList } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { DateMultiplePicker } from "@/components/ui/DateMultiplePicker";
import { TimePickerSelect } from "@/components/ui/TimePickerSelect";
import { format } from "date-fns";
import SelectButton from "@/components/ui/SelectButton";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";

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
        teacherId: string,
    };
}
const ZoomGroupForm: FC<ZoomGroupFormProps> = ({ setIsOpen, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState<CourseType>();
    const [teacherId, setTeacherId] = useState(initialData?.teacherId);
    const [courseId, setCourseId] = useState(initialData?.courseId);
    const [courseLevelId, setCourseLevelId] = useState(initialData?.courseLevel.id);
    const [studentIds, setStudentIds] = useState<string[]>(initialData ? initialData.studentIds : []);
    const [date, setDate] = useState<Date | undefined>(initialData ? initialData.startDate : new Date(new Date().setMinutes(30)));
    const [days, setDays] = useState<Date[]>([]);
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast } = useToast()

    const action = initialData ? "Edit" : "Create";

    const { data: teachersData } = api.trainers.getTeachers.useQuery();
    const { data: coursesData } = api.courses.getAll.useQuery();
    const { data: zoomClients } = api.zoomAccounts.getZoomAccounts.useQuery();
    const trpcUtils = api.useUtils();
    const createZoomGroupMutation = api.zoomGroups.createZoomGroup.useMutation(
        createMutationOptions({
            toast,
            loadingToast,
            setLoadingToast,
            trpcUtils,
            successMessageFormatter: ({ zoomGroup }) => {
                setIsOpen(false)
                return `${zoomGroup.groupNumber} Group Created`
            },
        })
    );
    const editZoomGroupMutation = api.zoomGroups.editZoomGroup.useMutation();
    const { toastError, toastSuccess } = useToast()

    const onCreate = () => {
        if (!date) return toastError("Please select the start date!")
        if (!teacherId) return toastError("Please select the trainer!")
        if (!courseId) return toastError("Please select the course!")
        if (!courseLevelId) return toastError("Please select the courseLevel!")
        if (studentIds.length === 0) return toastError("Please select students!")

        const materials = coursesData?.courses.find(c => c.id === courseId)?.levels.find(l => l.id === courseLevelId)?.materialItems || []

        const sessionDates = days.map((d, idx) => {
            const sessionId = materials[idx]?.id
            return {
                sessionId,
                date: d,
            }
        })

        if (sessionDates.some(d => !d.sessionId)) return toastError("Some sessions are missing!")

        createZoomGroupMutation.mutate({
            sessionDates,
            courseId,
            teacherId,
            courseLevelId,
            studentIds,
        })
    };

    const onEdit = () => {
        setLoading(true);
        editZoomGroupMutation.mutate({
            id: initialData?.id!,
            startDate: date!,
            teacherId,
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
            course.courseStatus.forEach(stat => {
                (stat.courseId === course.id && stat.status === "Waiting") && userIds.add(stat.userId);
            })
            return userIds.size;
        }).reduce((a, b) => a + b, 0),
        [coursesData?.courses]
    )

    useEffect(() => {
        setCourse(coursesData?.courses.find(course => course.id === courseId))
    }, [courseId])

    return (
        <div>
            {!teachersData || !coursesData ? <Spinner className="w-fit mx-auto" /> : (
                <div className="flex flex-col p-4 items-start gap-4 h-full whitespace-nowrap">
                    <SelectButton
                        value={teacherId}
                        placeholder="Select a trainer"
                        setValue={setTeacherId}
                        disabled={!!loadingToast}
                        listTitle="Trainers"
                        data={teachersData.teachers.map(Teacher => ({ active: true, label: Teacher.user.email, value: Teacher.id }))}
                    />
                    {initialData ? (
                        <Typography>{coursesData.courses.find(({ id }) => id === initialData.courseId)?.name} - {initialData.courseLevel.name}</Typography>
                    ) : (
                        <div className="flex items-center justify-between gap-4 w-full">
                            <SelectButton
                                disabled={!!loadingToast}
                                placeholder="Select a course"
                                value={courseId}
                                setValue={setCourseId}
                                listTitle={(
                                    <div className="flex items-center justify-between w-full">
                                        <Typography>Courses</Typography>
                                        <Typography className="text-xs">Total Waiting: {totalWaitingUsers}</Typography>
                                    </div>
                                )}
                                data={coursesData.courses.map(course => ({
                                    active: getWaitingList(course) >= 1,
                                    label: course.name,
                                    value: course.id,
                                    customLabel: (
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <Typography>{course.name}</Typography>
                                            <Typography className="text-xs">Waiting: {getWaitingList(course)}</Typography>
                                        </div>
                                    )
                                }))}
                            />
                            {course && (
                                <SelectButton
                                    disabled={!!loadingToast}
                                    value={courseLevelId}
                                    setValue={setCourseLevelId}
                                    placeholder="Select Level..."
                                    listTitle={(
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <Typography>Levels</Typography>
                                            <Typography className="text-xs">Total Waiting for course: {getWaitingList(course)}</Typography>
                                        </div>
                                    )}
                                    data={course.levels.map(level => ({
                                        active: getLevelWaitingList(course, level.id) >= 1,
                                        label: level.name,
                                        value: level.id,
                                        customLabel: (
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <Typography>{level.name}</Typography>
                                                <Typography className="text-xs">Waiting: {getLevelWaitingList(course, level.id)}</Typography>
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
                                    <div key={userId} className="flex items-center justify-between w-full gap-4">
                                        <Typography className="mr-auto">{email}</Typography>
                                        <WrapWithTooltip text="Go to account">
                                            <Link
                                                href={`/admin/users_management/account/${userId}`}
                                                target="_blank"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <ExternalLink className="w-4 h-4 text-info"></ExternalLink>
                                            </Link>
                                        </WrapWithTooltip>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <SelectField
                            className="col-span-2"
                            multiSelect
                            values={studentIds}
                            setValues={setStudentIds}
                            placeholder="Select Users..."
                            listTitle="Users"
                            data={course?.courseStatus
                                .filter(stat => stat.courseLevelId === courseLevelId && stat.status === "Waiting")
                                .filter((stat, index, self) => index === self.findIndex(({ userId }) => stat.userId === userId))
                                .map((stat, i) => {
                                    const order = course?.orders.find(or => or.userId === stat.userId && or.courseId === stat.courseId)
                                    const isPrivate = stat.isPrivate

                                    return ({
                                        Active: true,
                                        label: stat.user.name || `${i}`,
                                        value: stat.user.id || `${i}`,
                                        customLabel: (
                                            <TooltipProvider>
                                                <Typography className="mr-auto">{stat.user.name}</Typography>
                                                <Typography className="text-xs">{isPrivate ? "Private" : "Group"}</Typography>
                                                <Tooltip delayDuration={10}>
                                                    <TooltipTrigger>
                                                        <Link
                                                            href={`/admin/users_management/account/${stat.user.id}`}
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
                                }) || []
                            }
                        />
                    )}
                    <TimePickerSelect
                        date={date}
                        setDate={setDate}
                    />
                    <div className="flex gap-4">
                        <DateMultiplePicker
                            trainerSessions={teachersData?.teachers.find(t => t.id === teacherId)?.groups.flatMap(g => g.zoomSessions).flatMap(s => s.sessionDate) || []}
                            hours={date?.getHours() || 0}
                            minutes={date?.getMinutes() || 0}
                            maxDays={coursesData.courses.find(c => c.id === courseId)?.levels.find(l => l.id === courseLevelId)?.materialItems.length || 0}
                            zoomClients={zoomClients?.zoomAccounts || []}
                            days={days}
                            setDays={setDays}
                        />
                        <div className="flex flex-col gap-2 whitespace-nowrap">
                            {coursesData.courses.find(c => c.id === courseId)?.levels.find(l => l.id === courseLevelId)?.materialItems.sort((a, b) => a.sessionOrder - b.sessionOrder).map((item, idx) => (
                                <>
                                    <Typography>{item.title}</Typography>
                                    <Typography>{days[idx] && format(days[idx], "PPPP")}</Typography>
                                    <Separator />
                                </>
                            ))}
                        </div>
                    </div>
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
                <Button disabled={loading || !!loadingToast} onClick={initialData ? onEdit : onCreate}>
                    <Typography variant={"buttonText"}>{action}</Typography>
                </Button>
            </div>
        </div >
    );
};

export default ZoomGroupForm;
