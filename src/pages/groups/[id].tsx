import AppLayout from "@/components/layout/AppLayout";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeftToLineIcon, BookMarked, CalendarDays, ClipboardType, ExternalLink, MessageSquare, Users, VoteIcon } from "lucide-react";
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
import SelectField from "@/components/salesOperation/SelectField";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const statusMap: {
    scheduled: "primary";
    ongoing: "info";
    completedOnTime: "success";
    completedOffTime: "secondary";
    cancelled: "destructive";
} = {
    scheduled: "primary",
    ongoing: "info",
    completedOnTime: "success",
    completedOffTime: "secondary",
    cancelled: "destructive"
};

const GroupPage: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
    const [isQuizzesOpen, setIsQuizzesOpen] = useState(false);
    const [studentIds, setStudentIds] = useState<string[]>([]);
    const router = useRouter()
    const id = router.query.id as string

    const { toastSuccess, toastError } = useToast()
    const { data } = api.zoomGroups.getZoomGroupById.useQuery({ id })
    const trpcUtils = api.useContext()
    const setSessionAttendanceMutation = api.zoomGroups.setSessionAttendance.useMutation()

    const groupPrice = useMemo(() => {
        return data?.zoomGroup?.course?.groupPrice
    }, [data?.zoomGroup])

    const groupIncome = useMemo(() => {
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
                                <Link href={`/groups`} className="text-info">
                                    <ArrowLeftToLineIcon />
                                </Link>
                                <ConceptTitle className="hidden md:block">{data.zoomGroup.groupNumber || "loading..."}</ConceptTitle>
                                <ConceptTitle className="md:hidden truncate w-72">{data.zoomGroup.groupNumber || "loading..."}</ConceptTitle>
                            </div>
                            <div className="flex gap-2 items-center">
                                <ActionCell
                                    isGroupPage
                                    courseId={data.zoomGroup.courseId!}
                                    id={data.zoomGroup.id}
                                    startDate={data.zoomGroup.startDate}
                                    status={data.zoomGroup.groupStatus}
                                    studentIds={data.zoomGroup.studentIds}
                                    trainerId={data.zoomGroup.trainerId!}
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
                                            <Avatar className="w-24 h-24">
                                                <AvatarImage alt={getInitials(data.zoomGroup.trainer?.user.name) || ""} src={data.zoomGroup.trainer?.user.image || ""} />
                                                <AvatarFallback>{getInitials(data.zoomGroup.trainer?.user.name) || ""}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-2">
                                                <Typography variant={"secondary"}>{data.zoomGroup.trainer?.user.name || ""}</Typography>
                                                <Link href={`/account/${data.zoomGroup.trainer?.user.id}`}>
                                                    <Button variant={"link"}>
                                                        <Typography variant={"bodyText"}>{data.zoomGroup.trainer?.user.email || ""}</Typography>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Typography>Phone: {data.zoomGroup.trainer?.user.phone || ""}</Typography>
                                            <Link href={`https://wa.me/${data.zoomGroup.trainer?.user.phone}`} target="_blank">
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
                                        <Typography className="text-sm text-success">{format(data.zoomGroup.startDate, "PPPPp")}</Typography>
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
                                                        active: student.courseStatus.some(({ courseId, state }) => courseId === data.zoomGroup?.courseId && state === "ongoing"),
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
                                        title="Set Quizzes"
                                        description="Rate each student quiz"
                                        isOpen={isQuizzesOpen}
                                        onClose={() => setIsQuizzesOpen(false)}
                                        children={(
                                            <div className="space-y-4">
                                                <SelectField
                                                    disabled={isLoading}
                                                    multiSelect
                                                    data={data.zoomGroup.students.map(student => ({
                                                        active: student.courseStatus.some(({ courseId, state }) => courseId === data.zoomGroup?.courseId && state === "ongoing"),
                                                        label: student.email,
                                                        value: student.id,
                                                    }))}
                                                    listTitle="Students"
                                                    placeholder="Search students"
                                                    values={studentIds}
                                                    setValues={setStudentIds}
                                                />
                                                <div className="flex items-center gap-4 justify-end">
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={() => setIsQuizzesOpen(false)}
                                                        variant={"outline"}
                                                        customeColor={"destructiveOutlined"}
                                                    >Cancel</Button>
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={handleSetAttendance}
                                                        customeColor={"primary"}
                                                    >Submit</Button>
                                                </div>
                                            </div>
                                        )}
                                    />
                                    <Modal
                                        title="Set Assignments"
                                        description="rate each student assignment"
                                        isOpen={isAssignmentsOpen}
                                        onClose={() => setIsAssignmentsOpen(false)}
                                        children={(
                                            <div className="space-y-4">

                                                <div className="flex items-center gap-4 justify-end">
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={() => setIsAssignmentsOpen(false)}
                                                        variant={"outline"}
                                                        customeColor={"destructiveOutlined"}
                                                    >Cancel</Button>
                                                    <Button
                                                        disabled={isLoading}
                                                        onClick={handleSetAttendance}
                                                        customeColor={"primary"}
                                                    >Submit</Button>
                                                </div>
                                            </div>
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
                                                                    setIsQuizzesOpen(true)
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
                                                            set quizzes
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsAssignmentsOpen(true)
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
                                                            set assignment
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
                                                            <Link href={session.sessionLink} target={"_blank"}>
                                                                <ExternalLink className="w4 h-4" />
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            session link
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
                                        <div className="space-y-2">
                                            <Typography variant={"bodyText"}>{data.zoomGroup.course?.name}</Typography>
                                            <Typography variant={"bodyText"}>{data.zoomGroup.course?.level}</Typography>
                                        </div>
                                    </div>
                                </PaperContainer>
                            </div>
                            <PaperContainer className="flex flex-col gap-4 col-span-3 h-fit">
                                <Typography variant={"primary"}>Students</Typography>
                                <Separator />
                                <ScrollArea className="xl:max-h-[75vh]">
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
                                                        <Link href={`/account/${student.id}`}>
                                                            <Button variant={"link"}>
                                                                <Typography>{student.email}</Typography>
                                                            </Button>
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
                                <div>
                                    <Typography variant={"secondary"}>Attendance</Typography>
                                    {formatPercentage(calculateAttendancePercentages(data.zoomGroup).overallAttendancePercentage)}
                                </div>
                            </PaperContainer>
                        </div>
                        <PaperContainer className="flex items-center gap-4">
                            <Typography className="whitespace-nowrap">
                                {formatPercentage(data.zoomGroup.zoomSessions.filter(session => {
                                    return session.sessionStatus === "completedOnTime" || session.sessionStatus === "completedOffTime"
                                }).length / 8 * 100)} Completed
                            </Typography>
                            <Progress
                                value={data.zoomGroup.zoomSessions.filter(session => {
                                    return session.sessionStatus === "completedOnTime" || session.sessionStatus === "completedOffTime"
                                }).length / 8 * 100}
                            />
                        </PaperContainer>
                    </div>
                )}
            </main>
        </AppLayout>
    )
}

export default GroupPage