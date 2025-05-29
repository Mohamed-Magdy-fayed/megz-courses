"use client";

import { api } from "@/lib/api";
import { sessionColumns, MaterialColumn } from "./materials-columns";
import { DataTable } from "@/components/ui/DataTable";
import { DisplayError } from "@/components/ui/display-error";

export default function MaterialsClient({ courseSlug, levelSlug }: { courseSlug: string; levelSlug: string }) {
    const { data, isLoading, isError, error } = api.courseStatus.getLevelSessions.useQuery({ courseSlug, levelSlug });

    if (isError && error) {
        return <DisplayError message={error.message} />;
    }

    const sessions: MaterialColumn[] =
        data?.sessions?.map((session) => ({
            ...session,
            teacherName: data.group.teacherName,
            finalTestLink: data.finalTest.link,
            finalTestScore: data.finalTest.score,
            finalTestSubmitted: data.finalTest.submitted,
            certificateUrl: data.certificateUrl,
        })) ?? [];

    return (
        <DataTable
            data={sessions}
            columns={sessionColumns}
            isSuperSimple
            isLoading={isLoading}
            error={error ?? undefined}
            setData={() => { }}
        />
    );
}