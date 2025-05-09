import SelectButton from "@/components/ui/SelectButton";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

export default function TeacherSelectField({ loading, teacherId, setTeacherId }: {
    loading: boolean;
    teacherId: string | undefined;
    setTeacherId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const { data, isLoading } = api.trainers.getTeachers.useQuery()

    return (
        <SelectButton
            data={data?.teachers.map(teacher => ({
                active: true,
                label: teacher.user.name,
                value: teacher.id,
            })) || []}
            disabled={loading || isLoading}
            placeholder="Select Trainer"
            value={teacherId}
            setValue={setTeacherId}
            listTitle="Trainers"
        />
    )
}
