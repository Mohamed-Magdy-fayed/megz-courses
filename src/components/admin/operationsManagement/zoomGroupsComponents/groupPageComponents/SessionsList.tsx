import EditSessionForm from "@/components/admin/operationsManagement/zoomGroupsComponents/EditSessionForm";
import AssignmentsResultsModal from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/modals/AssignmentsResultsModal";
import AttendanceModal from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/modals/AttendanceModal";
import QuizzesResultsModal from "@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/modals/QuizzesResultsModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/Typoghraphy";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { env } from "@/env.mjs";
import { api } from "@/lib/api";
import { validSessionStatusesColors } from "@/lib/enumColors";
import { preMeetingLinkConstructor } from "@/lib/meetingsHelpers";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BookMarked, EditIcon, LinkIcon, UsersIcon, VoteIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SessionsList({ groupId, students }: { groupId: string; students: { id: string; email: string; }[] }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
    const [isQuizzesOpen, setIsQuizzesOpen] = useState(false);
    const [studentIds, setStudentIds] = useState<string[]>([]);

    const { data: zoomSessions, isLoading, isError, error } = api.zoomGroups.getGroupSessions.useQuery(groupId)

    if (isLoading) return <Skeleton className="w-full h-96" />
    if (isError) return <Skeleton className="w-full h-96 animate-none" children={error.message} />

    return (
        <Card>
            <Modal
                title="Set Attendance"
                description="select students who attended the session"
                isOpen={isAttendanceOpen}
                onClose={() => setIsAttendanceOpen(false)}
                children={(
                    <AttendanceModal attendersLength={zoomSessions.length} groupStudents={students} sessionId={sessionId} setSessionId={setSessionId} studentIds={studentIds} setStudentIds={setStudentIds} />
                )}
            />
            <Modal
                title="Quizzes"
                description="View each Student Quiz result"
                isOpen={isQuizzesOpen}
                onClose={() => setIsQuizzesOpen(false)}
                children={(
                    <QuizzesResultsModal sessionId={sessionId} />
                )}
            />
            <Modal
                title="View Assignments"
                description="View each Student Assignment rating"
                isOpen={isAssignmentsOpen}
                onClose={() => setIsAssignmentsOpen(false)}
                children={(
                    <AssignmentsResultsModal sessionId={sessionId} />
                )}
            />
            <Modal
                title="Edit Session"
                description=""
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                children={(
                    <EditSessionForm setIsOpen={setIsEditOpen} initialData={zoomSessions.find(({ id }) => id === sessionId)} />
                )}
            />
            <CardHeader>
                <CardTitle>Sessions</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent>
                <ScrollArea className="flex flex-col gap-1">
                    {zoomSessions.map((session, i) => (
                        <div key={session.id}>
                            <div className="flex items-center flex-wrap gap-x-2">
                                <Typography className="text-primary">{i + 1}</Typography>
                                <Typography className="mr-auto" >{format(session.sessionDate, "PPp")}</Typography>
                                <div className="space-y-1 py-1 sm:py-0 sm:flex sm:items-center sm:gap-2 xl:flex-1 xl:justify-end">
                                    <SeverityPill color={validSessionStatusesColors(session.sessionStatus)}>{session.sessionStatus}</SeverityPill>
                                    <WrapWithTooltip text="Edit Session">
                                        <Button
                                            onClick={() => {
                                                setSessionId(session.id);
                                                setIsEditOpen(true);
                                            }}
                                            variant={"icon"}
                                            customeColor={"foregroundIcon"}
                                            className="relative"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </Button>
                                    </WrapWithTooltip>

                                    <WrapWithTooltip text="View Quizzes">
                                        <Button
                                            onClick={() => {
                                                setSessionId(session.id);
                                                setIsQuizzesOpen(true);
                                            }}
                                            variant={"icon"}
                                            customeColor={"primaryIcon"}
                                            className="relative"
                                        >
                                            <VoteIcon className="w-4 h-4" />
                                            <Badge
                                                className={cn(
                                                    "absolute !p-0 rounded-full -top-1 -right-1",
                                                    session.quizzes.length < studentIds.length! && "text-primary",
                                                    session.quizzes.length === 0 && "text-destructive"
                                                )}
                                            >
                                                {session.quizzes.length}
                                            </Badge>
                                        </Button>
                                    </WrapWithTooltip>

                                    <WrapWithTooltip text="View Assignment">
                                        <Button
                                            onClick={() => {
                                                setSessionId(session.id);
                                                setIsAssignmentsOpen(true);
                                                console.log(session);
                                                
                                            }}
                                            variant={"icon"}
                                            customeColor={"infoIcon"}
                                            className="relative"
                                        >
                                            <BookMarked className="w-4 h-4" />
                                            <Badge
                                                className={cn(
                                                    "absolute !p-0 rounded-full -top-1 -right-1",
                                                    session.assignments.length < studentIds.length! && "text-primary",
                                                    session.assignments.length === 0 && "text-destructive"
                                                )}
                                            >
                                                {session.assignments.length}
                                            </Badge>
                                        </Button>
                                    </WrapWithTooltip>

                                    <WrapWithTooltip text="Set Attendance">
                                        <Button
                                            onClick={() => {
                                                setSessionId(session.id);
                                                setStudentIds(session.attenders.length > 0 ? session.attenders : studentIds);
                                                setIsAttendanceOpen(true);
                                            }}
                                            variant={"icon"}
                                            customeColor={"successIcon"}
                                            className="relative"
                                        >
                                            <UsersIcon className="w-4 h-4" />
                                            <Badge
                                                className={cn(
                                                    "absolute !p-0 rounded-full -top-1 -right-1",
                                                    session.attenders.length < studentIds.length && "text-primary",
                                                    session.attenders.length === 0 && "text-destructive"
                                                )}
                                            >
                                                {session.attenders.length}
                                            </Badge>
                                        </Button>
                                    </WrapWithTooltip>

                                    <WrapWithTooltip text="Session Internal Link">
                                        <Link
                                            href={`/${preMeetingLinkConstructor({
                                                meetingNumber: session.meetingNumber,
                                                meetingPassword: session.meetingPassword,
                                                sessionTitle: session.materialItem?.title || "",
                                                leaveUrl: `${env.NEXT_PUBLIC_NEXTAUTH_URL}admin/operations_management/groups/${groupId}`,
                                                sessionId: session.id,
                                                isZoom: !!session.zoomClient?.isZoom,
                                            })}`}
                                            target={"_blank"}
                                        >
                                            <Button variant={"icon"} customeColor={"foregroundIcon"}>
                                                <LinkIcon className="w4 h-4" />
                                            </Button>
                                        </Link>
                                    </WrapWithTooltip>
                                </div>
                            </div>
                            <Separator />
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
