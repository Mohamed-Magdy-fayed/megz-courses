import SingleSelectField from "@/components/general/selectFields/SingleSelectField";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

export default function CourseSelectField({ loading, courseId, setCourseId }: {
    loading: boolean;
    courseId: string | undefined;
    setCourseId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const { data, isLoading } = api.courses.getAll.useQuery()

    return (
        <SingleSelectField
            data={data?.courses.map(course => ({
                Active: true,
                label: course.name,
                value: course.id,
            })) || []}
            isLoading={loading || isLoading}
            placeholder="Select Course"
            selected={courseId}
            setSelected={setCourseId}
            title="Courses"
        />
    )
}
