import SelectButton from "@/components/ui/SelectButton";
import { Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

export default function CourseSelectField({ loading, courseId, setCourseId, withWaiting }: {
    withWaiting?: boolean;
    loading: boolean;
    courseId: string | undefined;
    setCourseId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const { data, isLoading } = api.courses.getAll.useQuery()

    return (
        <SelectButton
            data={data?.courses.map(course => ({
                active: true,
                label: course.name,
                value: course.id,
                customLabel: withWaiting && (
                    <div className="flex items-center justify-between gap-4">
                        <Typography>{course.name}</Typography>
                        <Typography className="text-xs">Waiting: {course.courseStatus.filter(s => s.status === "Waiting").length}</Typography>
                    </div>
                )
            })) || []}
            disabled={loading || isLoading}
            placeholder="Select Course"
            value={courseId}
            setValue={setCourseId}
            listTitle={
                withWaiting
                    ? (
                        <div className="flex items-center justify-between gap-4">
                            <Typography>Courses</Typography>
                            <Typography className="text-xs">Total Waiting: {data?.courses.flatMap(c => c.courseStatus.filter(s => s.status === "Waiting")).length}</Typography>
                        </div>
                    )
                    : "Courses"
            }
        />
    )
}
