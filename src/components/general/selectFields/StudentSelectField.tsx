import MultiSelectField from "@/components/general/selectFields/MultiSelectField";
import { Typography } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

export default function StudentSelectField({ loading, levelId, studentIds, setStudentIds }: {
    levelId?: string;
    loading: boolean;
    studentIds: string[];
    setStudentIds: Dispatch<SetStateAction<string[]>>;
}) {
    const { data, isLoading } = api.traineeList.getLevelWaitingList.useQuery({ levelId: levelId! }, { enabled: !!levelId })

    return (
        <MultiSelectField<string>
            data={data?.rows.map(row => ({
                active: true,
                label: row.user.name,
                value: row.userId,
                customLabel: (
                    <div className="flex items-center justify-between gap-4">
                        <Typography>{row.user.name}</Typography>
                        <Typography className="text-xs">{row.isPrivate ? "Private" : "Group"}</Typography>
                    </div>
                )
            })) || []}
            isLoading={loading || isLoading || !levelId}
            disabled={!levelId}
            placeholder="Select Students"
            selected={studentIds}
            setSelected={setStudentIds}
            title={"Students"}
        />
    )
}
