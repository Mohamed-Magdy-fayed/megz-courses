import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/Typoghraphy'
import { getInitials } from '@/lib/getInitials'
import { Prisma } from '@prisma/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Link } from 'lucide-react'
import { format } from 'date-fns'
import { FC } from 'react'
import { env } from '@/env.mjs'
import { isTimePassed } from '@/lib/utils'

type OralTestCardProps = {
    courseName: string;
    courseSlug: string;
    placementTest: Prisma.PlacementTestGetPayload<{
        include: {
            trainer: {
                include: { user: true }
            },
            student: { include: { courseStatus: { include: { course: true, level: true } } } },
            course: true;
        }
    }>
}

const OralTestCard: FC<OralTestCardProps> = ({ courseName, placementTest, courseSlug }) => {
    const isOralTestTimePassed = isTimePassed(placementTest.oralTestTime.getTime() || new Date().getTime())

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
                                <AvatarImage src={`${placementTest.trainer.user.image}`} />
                                <AvatarFallback>
                                    {getInitials(`${placementTest.trainer.user.name}`)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-2">
                                <Typography variant={"primary"}>
                                    {placementTest.trainer.user.name}
                                </Typography>
                                <Typography variant={"secondary"}>
                                    {placementTest.trainer.user.email}
                                </Typography>
                                <Typography variant={"secondary"}>
                                    {placementTest.trainer.user.phone}
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
                {placementTest?.student.courseStatus.some(({ course }) => course.slug === courseSlug) ? (
                    <Typography>
                        Oral Test Result: <span className="text-primary">{placementTest?.student.courseStatus.find(({ course }) => course.slug === courseSlug)?.level?.name}</span>
                    </Typography>
                ) : (
                    <Link target="_blank" href={`/meeting/?mn=${placementTest?.oralTestMeeting.meetingNumber}&pwd=${placementTest?.oralTestMeeting.meetingPassword}&session_title=Placement_Test&leave_url=${env.NEXT_PUBLIC_NEXTAUTH_URL}placement_test/${placementTest?.course.slug}`}>
                        <Button disabled={isOralTestTimePassed}>Join Meeting</Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    )
}

export default OralTestCard