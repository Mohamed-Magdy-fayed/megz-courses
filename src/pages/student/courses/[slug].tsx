import CourseShowcase from "@/components/admin/systemManagement/contentComponents/materials/CourseShowcase"
import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout"
import EnrollmentModal from "@/components/student/courses/EnrollmentModal"
import Spinner from "@/components/ui/Spinner"
import { Typography } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { api } from "@/lib/api"
import { cn, formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { BookOpenCheck, BookPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const CoursePage = () => {
    const router = useRouter()
    const slug = router.query.slug as string

    const courseQuery = api.courses.getBySlug.useQuery({ slug }, {
        enabled: false,
    })
    const userQuery = api.users.getCurrentUser.useQuery(undefined, {
        enabled: false,
    })

    const course = courseQuery.data?.course
    const level = courseQuery.data?.course?.levels[0]

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!slug) return
        courseQuery.refetch()
        userQuery.refetch()
    }, [slug])

    if (!course) return (
        <div className="w-screen h-screen grid place-content-center">
            <Spinner />
        </div>
    )

    return (
        <LandingLayout>
            <div className="grid grid-cols-12 md:gap-4">
                <div className="col-span-12 md:col-span-4 md:order-1 lg:col-span-4 md:p-4">
                    <Card className="overflow-hidden sticky top-4">
                        <CardHeader className="p-0">
                            <div
                                style={{ backgroundImage: `url("${course.image}")` || "" }}
                                className={cn("grid px-8 py-20 place-content-center isolate after:content after:absolute after:inset-0 after:bg-muted/40 w-full rounded-b-none relative bg-cover bg-center")}
                            >
                                <Typography className="z-10 text-background" variant={"secondary"}>{course.name}</Typography>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <Typography variant={"secondary"}>Description</Typography>
                                <div>{course.description}</div>
                            </div>
                            <div>
                                <Typography variant={"secondary"}>Levels: </Typography>
                                <div className="flex gap-2 flex-wrap">
                                    {course.levels.map(level => (
                                        <Typography key={level.id}>{level.name}</Typography>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4 items-center justify-between flex-wrap p-4">
                            {userQuery.data?.user?.courseStatus.some(status => status.courseId === course.id) ? (
                                <Link href={`/student/my_courses/${userQuery.data?.user?.courseStatus.find(status => status.courseId === course.id)?.course.slug}`}>
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
                            <Typography variant={"secondary"} className="text-success">{formatPrice(course.groupPrice)}</Typography>
                        </CardFooter>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-8 flex flex-col items-start lg:col-span-8 md:p-4">
                    <div className="p-4 w-full flex items-center justify-between">
                        <Typography variant={"primary"}>{course.name}</Typography>
                        <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                    </div>
                    {!level?.materialItems[0] ? (
                        <div className="p-4 space-x-4">
                            <Typography>{level?.materialItems.length} Materials</Typography>
                            <Typography>-</Typography>
                            <Typography>
                                {level?.materialItems[0]!?.title || "No Material"}
                            </Typography>
                        </div>
                    ) : !courseQuery.data?.course ? <Spinner /> : (
                        <CourseShowcase course={courseQuery.data.course} />
                    )}
                </div>
            </div>
        </LandingLayout>
    )
}

export default CoursePage