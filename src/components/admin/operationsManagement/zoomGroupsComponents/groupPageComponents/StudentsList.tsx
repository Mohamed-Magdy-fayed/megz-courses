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

export default function StudentsList({ students, attendance, groupId }: { groupId: string; students: { id: string, name: string, email: string, phone?: string, image?: string | null }[], attendance: string }) {
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
                                <Typography>{student.email}</Typography>
                                <Typography>{student.phone || "no phone"}</Typography>
                            </div>
                            <WrapWithTooltip text="Go to discussion">
                                <Button variant="outline" customeColor="primaryOutlined">
                                    <Link href={`/admin/operations_management/discussions/${groupId}/${student.id}`}>
                                        <MessagesSquareIcon className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </WrapWithTooltip>
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
