import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'
import { getInitials } from '@/lib/getInitials'
import { Prisma } from '@prisma/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { FC } from 'react'
import { isTimePassed } from '@/lib/utils'
import Link from 'next/link'
import { preMeetingLinkConstructor } from '@/lib/meetingsHelpers'

type OralTestCardProps = {
    courseName: string;
    courseSlug: string;
    placementTest: Prisma.PlacementTestGetPayload<{
        include: {
            tester: {
                include: { user: true }
            },
            student: { include: { courseStatus: { include: { course: true, level: true } } } },
            course: true;
            zoomSessions: { include: { zoomClient: true } };
        }
    }>
}

const OralTestCard: FC<OralTestCardProps> = ({ courseName, placementTest, courseSlug }) => {
    const isOralTestTimePassed = isTimePassed(placementTest.oralTestTime.getTime() || new Date().getTime())
    const session = placementTest.zoomSessions.find(s => s.sessionStatus !== "Cancelled")
    const oralTestLink = preMeetingLinkConstructor({
        isZoom: !!session?.zoomClient?.isZoom,
        meetingNumber: session?.meetingNumber || "",
        meetingPassword: session?.meetingPassword || "",
        sessionTitle: `Placement test for ${courseName} course`,
        sessionId: session?.id,
    })

    return (
        <Card className="col-span-12 xl:col-span-4 w-full h-fit">
            <CardHeader>
                <Typography variant={"secondary"}>{courseName} Course Oral Test</Typography>
            </CardHeader>
            {placementTest ? (
                <CardContent className="space-y-4">
                    <Typography variant={"secondary"}>Test Time: </Typography>
                    <Typography>{format(placementTest.oralTestTime, "PPPPp")}</Typography>
                    <Separator />
                    <div className="flex flex-col gap-4">
                        <Typography variant={"secondary"}>Trainer Information</Typography>
                        <div className="flex items-center gap-2" >
                            <Avatar>
                                <AvatarImage src={`${placementTest.tester.user.image}`} />
                                <AvatarFallback>
                                    {getInitials(`${placementTest.tester.user.name}`)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                                <Typography variant={"primary"}>
                                    {placementTest.tester.user.name}
                                </Typography>
                                <Typography variant={"secondary"}>
                                    {placementTest.tester.user.email}
                                </Typography>
                                <Typography variant={"secondary"}>
                                    {placementTest.tester.user.phone}
                                </Typography>
                            </div>
                        </div>
                        <Separator />
                    </div>
                </CardContent>
            ) : (
                <CardContent>
                    Not yet Scheduled
                </CardContent>
            )}
            <CardFooter>
                {placementTest?.student.courseStatus.some(({ course, status }) => course.slug === courseSlug && status !== "OrderPaid") ? (
                    <Typography>
                        Oral Test Result: <span className="text-primary">{placementTest?.student.courseStatus.find(({ course }) => course.slug === courseSlug)?.level?.name}</span>
                    </Typography>
                ) : (
                    <Link
                        target="_blank"
                        href={oralTestLink || ""}
                    // href={`/meeting/?mn=${placementTest?.oralTestMeeting.meetingNumber}&pwd=${placementTest?.oralTestMeeting.meetingPassword}&session_title=Placement_Test&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}placement_test/${placementTest?.course.slug}`}
                    >
                        <Button disabled={isOralTestTimePassed || !oralTestLink}>Join Meeting</Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    )
}

export default OralTestCard