import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import type { NextPage } from "next";
import { useMemo } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { calculateAttendancePercentages, formatPercentage, formatPrice } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import ActionCell from "@/components/admin/operationsManagement/zoomGroupsComponents/ActionCell";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import GoBackButton from "@/components/ui/go-back";
import TrainerCard from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/TrainerCard";
import { Skeleton } from "@/components/ui/skeleton";
import SessionsList from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/SessionsList";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const GroupPage: NextPage = () => {
    const router = useRouter()
    const id = router.query.id as string

    const { data, isLoading } = api.zoomGroups.getZoomGroupById.useQuery({ id }, { enabled: !!id })

    return (
        <AppLayout>
            <main className="flex">
                {!data?.zoomGroup ? <Spinner className="mx-auto" /> : (
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
                            <Card className="flex flex-col gap-4 col-span-12 xl:col-span-6 row-span-2">
                                <CardHeader><CardTitle>Students</CardTitle></CardHeader>
                                <Separator />
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        {data.zoomGroup.students.map(student => (
                                            <div key={student.id} className="flex items-center gap-2 h-min">
                                                <Avatar>
                                                    <AvatarImage src={student.image!}></AvatarImage>
                                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col w-full">
                                                    <Typography>{student.name}</Typography>
                                                    <Tooltip>
                                                        <TooltipTrigger className="w-fit" asChild>
                                                            <Link className="in-table-link" href={`/admin/users_management/account/${student.id}`}>
                                                                <Typography>{student.email}</Typography>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="flex">
                                                            Go to account <ExternalLink className="w-4 h-4 ml-2" />
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Typography>{student.phone || "no phone"}</Typography>
                                                    <Separator />
                                                </div>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </CardContent>
                                <Separator />
                                <CardFooter>
                                    <Typography variant={"secondary"}>Attendance</Typography>
                                    {" "}
                                    {formatPercentage(calculateAttendancePercentages(data.zoomGroup).overallAttendancePercentage || 0)}
                                </CardFooter>
                            </Card>
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
