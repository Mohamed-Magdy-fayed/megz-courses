"use client";

import { DataTable } from "@/components/ui/DataTable";
import { LevelColumn, levelColumns } from "./levels-columns";
import { api } from "@/lib/api";
import { DisplayError } from "@/components/ui/display-error";

export default function LevelsClient({ courseSlug }: { courseSlug: string }) {
    const { data, isLoading, isError, error } = api.courseStatus.getByCourse.useQuery({ courseSlug })
    const levels: LevelColumn[] = data?.levels || [];

    if (isError && error) {
        return <DisplayError message={error.message} />
    }

    return (
        <DataTable
            data={levels}
            columns={levelColumns}
            isSuperSimple
            isLoading={isLoading}
            error={error ?? undefined}
            setData={() => { }}
        />
    );
}