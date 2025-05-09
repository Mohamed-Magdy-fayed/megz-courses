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
import SingleSelectCourse from "@/components/general/selectFields/SingleSelectCourse";
import TeacherSelectField from "@/components/general/selectFields/TeacherSelectField";
import CourseSelectField from "@/components/general/selectFields/CourseSelectField";
import LevelSelectField from "@/components/general/selectFields/LevelSelectField";
import { DataTable } from "@/components/ui/DataTable";
import GroupStudentsTable from "@/components/admin/operationsManagement/zoomGroupsComponents/GroupStudentsTable";
import StudentSelectField from "@/components/general/selectFields/StudentSelectField";

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
    const [teacherId, setTeacherId] = useState(initialData?.teacherId);
    const [courseId, setCourseId] = useState(initialData?.courseId);
    const [courseLevelId, setCourseLevelId] = useState(initialData?.courseLevel.id);
    const [studentIds, setStudentIds] = useState<string[]>(initialData ? initialData.studentIds : []);
    const [date, setDate] = useState<Date | undefined>(initialData ? initialData.startDate : new Date(new Date().setMinutes(30)));
    const [days, setDays] = useState<Date[]>([]);
    const [loadingToast, setLoadingToast] = useState<toastType>()
    const { toast } = useToast()

    const action = initialData ? "Edit" : "Create";

    const { data: materialsData } = api.materials.getBycourseLevelId.useQuery({ courseLevelId: courseLevelId! }, { enabled: !!courseLevelId });
    const { data: courseData } = api.courses.getById.useQuery({ id: courseId! }, { enabled: !!courseId });
    const { data: trainerSessions } = api.trainers.getTrainerSessions.useQuery(teacherId!, { enabled: !!teacherId });
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

        const materials = materialsData?.materialItems || []

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

    const totalWaitingUsers = useMemo(() => courseData?.course?.courseStatus.length, [courseData?.course])

    return (
        <div>
            <div className="flex flex-col p-4 items-start gap-4 h-full whitespace-nowrap">
                <TeacherSelectField
                    teacherId={teacherId}
                    setTeacherId={setTeacherId}
                    loading={!!loadingToast}
                />
                <CourseSelectField
                    withWaiting
                    courseId={courseId}
                    setCourseId={setCourseId}
                    loading={!!loadingToast}
                />
                <LevelSelectField
                    withWaiting
                    courseId={courseId}
                    levelId={courseLevelId}
                    setLevelId={setCourseLevelId}
                    loading={!!loadingToast || !courseId}
                />
                {initialData ? (
                    <GroupStudentsTable studentIds={initialData.studentIds} />
                ) : (
                    <StudentSelectField
                        loading={!!loadingToast || !courseLevelId}
                        levelId={courseLevelId!}
                        studentIds={studentIds}
                        setStudentIds={setStudentIds}
                    />
                )}
                <TimePickerSelect
                    date={date}
                    setDate={setDate}
                />
                <div className="flex gap-4">
                    <DateMultiplePicker
                        trainerSessions={trainerSessions?.map(s => s.sessionDate) || []}
                        hours={date?.getHours() || 0}
                        minutes={date?.getMinutes() || 0}
                        maxDays={courseData?.course?.levels.find(l => l.id === courseLevelId)?.materialItems.length || 0}
                        zoomClients={zoomClients?.zoomAccounts || []}
                        days={days}
                        setDays={setDays}
                    />
                    <div className="flex flex-col gap-2 whitespace-nowrap">
                        {courseData?.course?.levels.find(l => l.id === courseLevelId)?.materialItems.sort((a, b) => a.sessionOrder - b.sessionOrder).map((item, idx) => (
                            <>
                                <Typography>{item.title}</Typography>
                                <Typography>{days[idx] && format(days[idx], "PPPP")}</Typography>
                                <Separator />
                            </>
                        ))}
                    </div>
                </div>
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
            </div>
        </div>
    );
};

export default ZoomGroupForm;
