import AppLayout from "@/components/layout/AppLayout";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeftToLineIcon, BookMarked, CalendarDays, EditIcon, ExternalLink, LinkIcon, MessageSquare, Users, VoteIcon } from "lucide-react";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { format } from "date-fns";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { calculateAttendancePercentages, cn, formatPercentage, formatPrice } from "@/lib/utils";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import ActionCell from "@/components/zoomGroupsComponents/ActionCell";
import { Separator } from "@/components/ui/separator";
import SelectField from "@/components/ui/SelectField";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/DataTable";
import { env } from "@/env.mjs";
import EditSessionForm from "@/components/zoomGroupsComponents/EditSessionForm";
import GoBackButton from "@/components/ui/go-back";

const statusMap: {
    Scheduled: "primary";
    Ongoing: "info";
    Starting: "secondary";
    Completed: "success";
    Cancelled: "destructive";
} = {
    Scheduled: "primary",
    Ongoing: "info",
    Starting: "secondary",
    Completed: "success",
    Cancelled: "destructive"
};

const GroupPage: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
    const [isQuizzesOpen, setIsQuizzesOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [studentIds, setStudentIds] = useState<string[]>([]);
    const router = useRouter()
    const id = router.query.id as string

    const { toastSuccess, toastError } = useToast()
    const { data } = api.zoomGroups.getZoomGroupById.useQuery({ id }, { enabled: !!id })
    const trpcUtils = api.useUtils()
    const setSessionAttendanceMutation = api.zoomGroups.setSessionAttendance.useMutation()

    const groupPrice = useMemo(() => {
        return data?.zoomGroup?.course?.groupPrice
    }, [data?.zoomGroup])

    const privatePrice = useMemo(() => {
        return data?.zoomGroup?.course?.privatePrice
    }, [data?.zoomGroup])

    const groupIncome = useMemo(() => {
        if (data?.zoomGroup?.students
            .some(s => s.orders
                .some(order => order.courseType.id === data.zoomGroup?.courseId && order.courseType.isPrivate))) return (privatePrice! * data?.zoomGroup?.studentIds.length!)

        return (groupPrice! * data?.zoomGroup?.studentIds.length!)
    }, [data?.zoomGroup, groupPrice])

    const trainerIncome = useMemo(() => {
        return data?.zoomGroup?.course?.instructorPrice
    }, [data?.zoomGroup])

    const netIncome = useMemo(() => {
        return groupIncome - trainerIncome!
    }, [groupIncome, trainerIncome])

    const handleSetAttendance = () => {
        setIsLoading(true)
        setSessionAttendanceMutation.mutate({
            sessionId,
            studentIds,
        }, {
            onSuccess: ({ updatedSession }) => {
                trpcUtils.zoomGroups.invalidate()
                    .then(() => {
                        setIsAttendanceOpen(false)
                        setSessionId("")
                        toastSuccess(`${updatedSession.attenders.length} students attended the session on ${format(updatedSession.sessionDate, "PPPPp")}`)
                    })
            },
            onError: ({ message }) => toastError(message),
            onSettled: () => setIsLoading(false),
        })
    }

    return (
        <AppLayout>
            <main className="flex">
                {!data?.zoomGroup ? <Spinner className="mx-auto" /> : (
                    <div className="flex w-full flex-col gap-4">
                        <div className="flex justify-between ">
                            <div className="flex items-center gap-2">
                                <GoBackButton />
                                <ConceptTitle className="hidden md:block">{data.zoomGroup.groupNumber || "loading..."}</ConceptTitle>
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
                        <div className="xl:grid xl:grid-cols-12 xl:gap-4 flex flex-col gap-4">
                            <div className="col-span-3 flex flex-col gap-4 md:flex-row xl:flex-col">
                                <PaperContainer className="flex flex-col flex-grow">
                                    <div className="flex flex-col gap-2">
                                        <Typography variant={"primary"}>Trainer</Typography>
                                        <Separator className="mb-4" />
                                        <div className="self-start flex items-center justify-between w-full">
                                            <Avatar className="w-16 h-16">
                                                <AvatarImage alt={getInitials(data.zoomGroup.teacher?.user.name) || ""} src={data.zoomGroup.teacher?.user.image || ""} />
                                                <AvatarFallback>{getInitials(data.zoomGroup.teacher?.user.name) || ""}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-2">
                                                <Typography variant={"secondary"}>{data.zoomGroup.teacher?.user.name || ""}</Typography>
                                                <Link className="in-table-link" href={`/admin/users_management/account/${data.zoomGroup.teacher?.user.id}`}>
                                                    {data.zoomGroup.teacher?.user.email || ""}
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Typography>Phone: {data.zoomGroup.teacher?.user.phone || ""}</Typography>
                                            <Link href={`https://wa.me/${data.zoomGroup.teacher?.user.phone}`} target="_blank">
                                                <Button variant={"icon"} customeColor={"successIcon"}>
                                                    <MessageSquare></MessageSquare>
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </PaperContainer>
                                <PaperContainer className="flex-grow">
                                    <Typography variant={"primary"}>Finance</Typography>
                                    <Separator className="mb-4" />
                                    {data.zoomGroup.course?.groupPrice ? (
                                        <div className="grid gap-2">
                                            <Typography>
                                                Group Price: {formatPrice(groupPrice!)}
                                            </Typography>
                                            <Typography>
                                                Group Income: {formatPrice(groupIncome)}
                                            </Typography>
                                            <Typography>
                                                Trainer Income: {formatPrice(trainerIncome!)}
                                            </Typography>
                                            <Typography>
                                                Net Income: {formatPrice(netIncome)}
                                            </Typography>
                                        </div>
                                    ) : "loading..."}
                                </PaperContainer>
                            </div>
                            <div className="col-span-6 flex flex-col gap-4">
                                <PaperContainer className="flex-grow flex flex-col">
                                    <Typography variant={"primary"}>Dates</Typography>
                                    <Separator className="mb-4" />
                                    <div className="flex items-center justify-between">
                                        <Typography className="text-sm text-success">{format(data.zoomGroup.zoomSessions[0]?.sessionDate || new Date(), "PPPPp")}</Typography>
                                        <CalendarDays />
                                        <Typography className="text-sm text-destructive">{format(data.zoomGroup.zoomSessions[data.zoomGroup.zoomSessions.length - 1]?.sessionDate || new Date(), "PPPPp")}</Typography>
                                    </div>
                                    <Typography variant={"secondary"} className="w-fit">
                                        Sessions
                                        <Separator className="mb-2" />
                                    </Typography>
                                    <Modal
                                        title="Set Attendance"
                                        description="select students who attended the session"
                                        isOpen={isAttendanceOpen}
                                        onClose={() => setIsAttendanceOpen(false)}
                                        children={(
                                            <div className="space-y-4">
                                                <SelectField
                                                    disabled={isLoading}
                                                    multiSelect
                                                    data={data.zoomGroup.students.map(student => ({
                                                        Active: student.courseStatus.some(({ courseId, status }) => courseId === data.zoomGroup?.courseId && status === "Ongoing"),
                                                        label: student.email,
                                                        value: student.id,
                                                    }))}
                                                    listTitle="Students"
                                                    placeholder="Search students"
                                                    values={studentIds}
                                                    setValues={setStudentIds}
                                                />
                                                <div className="flex items-center gap-4 justify-end">
                                                    {data.zoomGroup.zoomSessions.find(session => session.id === sessionId)?.attenders.length! > 0 ? (
                                                        <Typography className="mr-auto">
                                                            <Button
                                                                variant={"icon"}
                                                                customeColor={"infoIcon"}
                                                                disabled
                                                            >
                                                                {data.zoomGroup.zoomSessions.find(session => session.id === sessionId)?.attenders.length}
                                                            </Button>
                                                            students attended already
                                                        </Typography>
                                                    ) : null}
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={() => setIsAttendanceOpen(false)}
                                                        variant={"outline"}
                                                        customeColor={"destructiveOutlined"}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={handleSetAttendance}
                                                        customeColor={"primary"}
                                                    >
                                                        Submit
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <Modal
                                        title="Quizzes"
                                        description="View each Student Quiz result"
                                        isOpen={isQuizzesOpen}
                                        onClose={() => setIsQuizzesOpen(false)}
                                        children={(
                                            <div className="space-y-4">
                                                <DataTable
                                                    columns={[
                                                        {
                                                            accessorKey: "userId",
                                                            header: "Student",
                                                            cell: ({ row }) => <>{row.original.student.email}</>
                                                        },
                                                        {
                                                            accessorKey: "totalScore",
                                                            header: "Rating",
                                                            cell: ({ row }) => <>{formatPercentage(row.original.totalScore / row.original.systemForm.totalScore * 100)}</>
                                                        },
                                                    ]}
                                                    onDelete={() => { }}
                                                    setData={() => { }}
                                                    data={data.zoomGroup.zoomSessions.find(({ id }) => id === sessionId)?.quizzes || []}
                                                />
                                            </div>
                                        )}
                                    />
                                    <Modal
                                        title="View Assignments"
                                        description="View each Student Assignment rating"
                                        isOpen={isAssignmentsOpen}
                                        onClose={() => setIsAssignmentsOpen(false)}
                                        children={(
                                            <div className="space-y-4">
                                                <DataTable
                                                    columns={[
                                                        {
                                                            accessorKey: "userId",
                                                            header: "Student",
                                                            cell: ({ row }) => <>{row.original.student.email}</>
                                                        },
                                                        {
                                                            accessorKey: "rating",
                                                            header: "Rating",
                                                            cell: ({ row }) => <>{formatPercentage(row.original.totalScore / row.original.systemForm.totalScore * 100)}</>
                                                        },
                                                    ]}
                                                    onDelete={() => { }}
                                                    setData={() => { }}
                                                    data={data.zoomGroup.zoomSessions.find(({ id }) => id === sessionId)?.assignments || []}
                                                />
                                            </div>
                                        )}
                                    />
                                    <Modal
                                        title="Edit Session"
                                        description=""
                                        isOpen={isEditOpen}
                                        onClose={() => setIsEditOpen(false)}
                                        children={(
                                            <EditSessionForm setIsOpen={setIsEditOpen} initialData={data.zoomGroup.zoomSessions.find(({ id }) => id === sessionId)} />
                                        )}
                                    />
                                    <div className="flex flex-col gap-1">
                                        {data.zoomGroup.zoomSessions.map((session, i) => (
                                            <div key={session.id}>
                                                <div className="flex items-center flex-wrap gap-2 ">
                                                    <Typography className="text-primary">{i + 1}</Typography>
                                                    <Typography className="mr-auto" >{format(session.sessionDate, "PPp")}</Typography>
                                                    <SeverityPill color={statusMap[session.sessionStatus]}>{session.sessionStatus}</SeverityPill>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsEditOpen(true)
                                                                    setSessionId(session.id)
                                                                }}
                                                                variant={"icon"}
                                                                customeColor={"foregroundIcon"}
                                                                className="relative"
                                                            >
                                                                <EditIcon className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Edit Session
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsQuizzesOpen(true)
                                                                    setSessionId(session.id)
                                                                }}
                                                                variant={"icon"}
                                                                customeColor={"primaryIcon"}
                                                                className="relative"
                                                            >
                                                                <VoteIcon className="w-4 h-4" />
                                                                <Badge className={cn("absolute !p-0 rounded-full -top-1 -right-1", session.quizzes.length < data.zoomGroup?.studentIds.length! && "text-primary", session.quizzes.length === 0 && "text-destructive")} >
                                                                    {session.quizzes.length}
                                                                </Badge>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View quizzes
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsAssignmentsOpen(true)
                                                                    setSessionId(session.id)
                                                                }}
                                                                variant={"icon"}
                                                                customeColor={"infoIcon"}
                                                                className="relative"
                                                            >
                                                                <BookMarked className="w-4 h-4" />
                                                                <Badge className={cn("absolute !p-0 rounded-full -top-1 -right-1", session.assignments.length < data.zoomGroup?.studentIds.length! && "text-primary", session.assignments.length === 0 && "text-destructive")} >
                                                                    {session.assignments.length}
                                                                </Badge>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            View Assignment
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setSessionId(session.id)
                                                                    setStudentIds(session.attenders.length > 0 ? session.attenders : data.zoomGroup?.studentIds!)
                                                                    setIsAttendanceOpen(true)
                                                                }}
                                                                variant={"icon"}
                                                                customeColor={"successIcon"}
                                                                className="relative"
                                                            >
                                                                <Users className="w-4 h-4" />
                                                                <Badge className={cn("absolute !p-0 rounded-full -top-1 -right-1", session.attenders.length < data.zoomGroup?.studentIds.length! && "text-primary", session.attenders.length === 0 && "text-destructive")} >
                                                                    {session.attenders.length}
                                                                </Badge>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            set attendance
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link href={`/meeting/?mn=${data.zoomGroup?.meetingNumber}&pwd=${data.zoomGroup?.meetingPassword}&session_title=${session.materialItem?.title}&session_id=${session.id}&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}groups/${data.zoomGroup?.id}`} target={"_blank"}>
                                                                <Button variant={"icon"} customeColor={"foregroundIcon"}>
                                                                    <LinkIcon className="w4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Session internal link
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <Separator />
                                            </div>
                                        ))}
                                    </div>
                                </PaperContainer>
                                <PaperContainer className="flex-grow">
                                    <Typography variant={"primary"}>Course</Typography>
                                    <Separator className="mb-4" />
                                    <div className="flex items-center gap-4">
                                        <Image className="h-24" alt={data.zoomGroup.course?.name || ""} src={data.zoomGroup.course?.image || ""} width={100} height={100} />
                                        <div className="grid grid-cols-2 w-full">
                                            <div>
                                                <Typography variant={"secondary"}>Name</Typography>
                                                <Separator />
                                                <Typography variant={"bodyText"}>{data.zoomGroup.course?.name}</Typography>
                                            </div>
                                            <div>
                                                <Typography variant={"secondary"}>Level</Typography>
                                                <Separator />
                                                <Typography variant={"bodyText"}>{data.zoomGroup.courseLevel?.name}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                </PaperContainer>
                            </div>
                            <PaperContainer className="flex flex-col gap-4 col-span-3 h-fit">
                                <Typography variant={"primary"}>Students</Typography>
                                <Separator />
                                <ScrollArea className="xl:h-[65vh]">
                                    {data.zoomGroup.students.map(student => (
                                        <div key={student.id} className="flex items-center gap-2">
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
                                <Separator />
                                <div>
                                    <Typography variant={"secondary"}>Attendance</Typography>
                                    {formatPercentage(calculateAttendancePercentages(data.zoomGroup).overallAttendancePercentage || 0)}
                                </div>
                            </PaperContainer>
                        </div>
                        <PaperContainer className="flex items-center gap-4">
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
                        </PaperContainer>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}

export default GroupPage