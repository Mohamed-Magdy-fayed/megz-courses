import React, { useEffect, useState } from 'react'
import { Course, CourseLevel } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import Link from 'next/link'
import { Button } from '../ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { BookOpen, BookOpenCheck, BookPlus } from 'lucide-react'
import Spinner from '../Spinner'
import { Typography } from '../ui/Typoghraphy'
import { Skeleton } from '../ui/skeleton'
import EnrollmentModal from './EnrollmentModal'
import { api } from '@/lib/api'
import { useSession } from 'next-auth/react'

const LandingCourseCard = ({ course }: { course: Course & { levels: CourseLevel[] } }) => {
    const imageUrl = !course.image ? "" : `url(${course.image})`
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false)
    const { data: sessionData } = useSession()

    const userQuery = api.users.getCurrentUser.useQuery(undefined, { enabled: false })

    useEffect(() => {
        if (!sessionData?.user) return
        userQuery.refetch()
    }, [])

    return (
        <div
            key={course.id}
            className="w-full col-span-12 p-4 md:col-span-6 lg:col-span-4"
        >
            <Card className="h-full flex flex-col rounded-md overflow-hidden">
                <CardHeader className="p-0">
                    {course.image ? (
                        <div
                            style={{ backgroundImage: imageUrl }}
                            className={cn("grid place-content-center isolate after:content after:absolute after:inset-0 after:bg-muted/40 w-full h-24 rounded-b-none rounded-t-md relative bg-cover bg-center")}
                        >
                            <Typography variant={"secondary"} className="text-background z-10">{course.name}</Typography>
                        </div>
                    ) : (
                        <Skeleton className="w-full h-24 rounded-b-none grid place-content-center">
                            <Typography variant={"secondary"}>{course.name}</Typography>
                        </Skeleton>
                    )}
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-grow flex-col flex justify-between">
                    <div>
                        <Typography>
                            {course.description || "No description"}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-2 px-4 py-2 bg-muted/10 whitespace-nowrap">
                        <Typography >{formatPrice(course.groupPrice)}</Typography>
                        <Typography className="text-success truncate">{course.levels[0]?.name}</Typography>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Link href={`/courses/${course.slug}`}>
                        <Button className="gap-2" customeColor={"infoIcon"}>
                            View
                            <BookOpen />
                        </Button>
                    </Link>
                    {userQuery.data?.user?.courseStatus.some(status => status.courseId === course.id) ? (
                        <Link href={`/my_courses/${userQuery.data.user.courseStatus.find(status => status.courseId === course.id)?.course.slug}`}>
                            <Button>
                                <Typography>
                                    Go to courses
                                </Typography>
                                <BookOpenCheck />
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <EnrollmentModal
                                course={course}
                                loading={loading}
                                open={open}
                                setLoading={setLoading}
                                setOpen={setOpen}
                            />
                            <Button
                                disabled={loading}
                                onClick={() => setOpen(true)}
                            >
                                <Typography className={cn("", loading && "opacity-0")}>
                                    Endoll Now!
                                </Typography>
                                <BookPlus className={cn("", loading && "opacity-0")} />
                                {loading && <Spinner className="w-4 h-4 absolute" />}
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

export default LandingCourseCard