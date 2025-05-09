import SelectButton from "@/components/ui/SelectButton";
import { Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

export default function LevelSelectField({ loading, courseId, levelId, setLevelId, withWaiting }: {
    withWaiting?: boolean;
    courseId?: string;
    loading: boolean;
    levelId: string | undefined;
    setLevelId: Dispatch<SetStateAction<string | undefined>>;
}) {
    const { data, isLoading } = api.levels.getByCourseId.useQuery({ courseId: courseId! }, { enabled: !!courseId })

    return (
        <SelectButton
            data={data?.levels.map(level => ({
                active: true,
                label: level.name,
                value: level.id,
                customLabel: withWaiting && (
                    <div className="flex items-center justify-between gap-4">
                        <Typography>{level.name}</Typography>
                        <Typography className="text-xs">Waiting: {level.courseStatus.filter(s => s.status === "Waiting").length}</Typography>
                    </div>
                )
            })) || []}
            disabled={loading || isLoading}
            placeholder="Select Level"
            value={levelId}
            setValue={setLevelId}
            listTitle={
                withWaiting
                    ? (
                        <div className="flex items-center justify-between gap-4">
                            <Typography>Levels</Typography>
                            <Typography className="text-xs">Total Waiting: {data?.levels.flatMap(c => c.courseStatus.filter(s => s.status === "Waiting")).length}</Typography>
                        </div>
                    )
                    : "Levels"
            }
        />
    )
}
