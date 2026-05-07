import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/Typoghraphy'
import { getInitials } from '@/lib/getInitials'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import WrapWithTooltip from '@/components/ui/wrap-with-tooltip'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessagesSquareIcon } from 'lucide-react'
import StudentFinalExamAction from '@/components/admin/operationsManagement/zoomGroupsComponents/groupPageComponents/StudentFinalExamAction'
import { Badge } from '@/components/ui/badge'

type StudentListItem = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string | null;
    finalTestSubmission?: {
        id: string;
        oralFeedback: string | null;
        oralQuestions: string | null;
    };
    finalExamStatus: "NotSubmitted" | "Submitted" | "Processed";
    isFinalExamActionLocked: boolean;
    finalExamLockReason?: string;
}

export default function StudentsList({ students, attendance, groupId, fallbackOralQuestions }: { groupId: string; students: StudentListItem[], attendance: string, fallbackOralQuestions?: string | null }) {
    return (
        <Card className="flex flex-col gap-4">
            <CardHeader className="flex flex-row py-2 items-center justify-between gap-2">
                <CardTitle>Students</CardTitle>
                <Link href={`/admin/operations_management/discussions/${groupId}`}>
                    <Button>Group Discussion<MessagesSquareIcon size={20} className="ml-2" /></Button>
                </Link>
            </CardHeader>
            <Separator />
            <CardContent>
                <ScrollArea className="h-96 pr-4">
                    {students.map(student => (
                        <div key={student.id} className="flex items-center gap-2 h-min">
                            <Avatar>
                                <AvatarImage src={student.image!}></AvatarImage>
                                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col w-full">
                                <WrapWithTooltip text="Go to account">
                                    <Link className="in-table-link" href={`/admin/users_management/account/${student.id}`}>
                                        <Typography>{student.name}</Typography>
                                    </Link>
                                </WrapWithTooltip>
                                <Badge
                                    className={
                                        student.finalExamStatus === "Processed"
                                            ? "w-fit bg-emerald-100 text-emerald-700"
                                            : student.finalExamStatus === "Submitted"
                                                ? "w-fit bg-amber-100 text-amber-700"
                                                : "w-fit bg-slate-100 text-slate-700"
                                    }
                                >
                                    {student.finalExamStatus === "NotSubmitted"
                                        ? "Not Submitted"
                                        : student.finalExamStatus}
                                </Badge>
                                <Typography>{student.email}</Typography>
                                <Typography>{student.phone || "no phone"}</Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <StudentFinalExamAction
                                    studentName={student.name}
                                    finalSubmission={student.finalTestSubmission}
                                    fallbackOralQuestions={fallbackOralQuestions}
                                    isLocked={student.isFinalExamActionLocked}
                                    lockReason={student.finalExamLockReason}
                                />
                                <WrapWithTooltip text="Go to discussion">
                                    <Button variant="outline" customeColor="primaryOutlined">
                                        <Link href={`/admin/operations_management/discussions/${groupId}/${student.id}`}>
                                            <MessagesSquareIcon className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </WrapWithTooltip>
                            </div>
                        </div>
                    ))}
                    <Separator />
                </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter>
                <Typography variant={"secondary"}>Attendance</Typography>
                {" "}
                {attendance}
            </CardFooter>
        </Card>
    )
}
