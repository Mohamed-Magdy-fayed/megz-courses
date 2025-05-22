import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import { calculateAttendancePercentages, formatPercentage } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import ActionCell from "@/components/admin/operationsManagement/zoomGroupsComponents/ActionCell";
import GoBackButton from "@/components/ui/go-back";
import TrainerCard from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/TrainerCard";
import { Skeleton } from "@/components/ui/skeleton";
import SessionsList from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/SessionsList";
import { Card } from "@/components/ui/card";
import StudentsList from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/StudentsList";
import { DisplayError } from "@/components/ui/display-error";

const GroupPage: NextPage = () => {
    const router = useRouter()
    const id = router.query.id as string

    const { data, isLoading, isError, error } = api.zoomGroups.getZoomGroupById.useQuery({ id }, { enabled: !!id })

    return (
        <AppLayout>
            <main className="flex">
                {isLoading && !isError ? <Spinner className="mx-auto" /> :
                    isError && error ? <DisplayError message={error.message} /> :
                        !data.zoomGroup ? null : (
                            <div className="flex w-full flex-col gap-4">
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-2">
                                        <GoBackButton />
                                        <ConceptTitle className="hidden md:block text-balance">{data.zoomGroup.groupNumber || "loading..."}</ConceptTitle>
                                        <ConceptTitle className="md:hidden truncate w-72">{data.zoomGroup.groupNumber || "loading..."}</ConceptTitle>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <ActionCell
                                            isGroupPage
                                            courseId={data.zoomGroup.courseId!}
                                            courseLevel={data.zoomGroup.courseLevel!}
                                            id={data.zoomGroup.id}
                                            startDate={data.zoomGroup.startDate}
                                            status={data.zoomGroup.groupStatus}
                                            studentIds={data.zoomGroup.studentIds}
                                            teacherId={data.zoomGroup.teacherId!}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-12 xl:grid-cols-12 gap-4">
                                    <div className="col-span-full xl:col-span-6">
                                        {!data.zoomGroup.teacher?.user ? (
                                            <Skeleton className="w-full h-full" />
                                        ) : (
                                            <TrainerCard trainerUser={data.zoomGroup.teacher.user} />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-4 col-span-12 xl:col-span-6 row-span-2">
                                        <StudentsList
                                            groupId={id}
                                            students={data.zoomGroup.students}
                                            attendance={formatPercentage(calculateAttendancePercentages(data.zoomGroup).overallAttendancePercentage || 0)}
                                        />
                                    </div>
                                    <div className="col-span-full xl:col-span-6">
                                        {!data.zoomGroup.zoomSessions ? (
                                            <Skeleton className="w-full h-full" />
                                        ) : (
                                            <SessionsList groupId={id} students={data.zoomGroup.students} />
                                        )}
                                    </div>
                                </div>
                                <Card className="flex items-center gap-4 p-4">
                                    <Typography className="whitespace-nowrap">
                                        {formatPercentage(data.zoomGroup.zoomSessions.filter(session => {
                                            return session.sessionStatus === "Completed"
                                        }).length / data.zoomGroup.zoomSessions.length * 100)} Completed
                                    </Typography>
                                    <Progress
                                        value={data.zoomGroup.zoomSessions.filter(session => {
                                            return session.sessionStatus === "Completed"
                                        }).length / data.zoomGroup.zoomSessions.length * 100}
                                    />
                                </Card>
                            </div>
                        )}
            </main>
        </AppLayout>
    )
}

export default GroupPage
