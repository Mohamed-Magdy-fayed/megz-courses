import Spinner from "@/components/Spinner"
import MaterialShowcase from "@/components/contentComponents/materials/MaterialShowcase"
import EnrollmentModal from "@/components/courses/EnrollmentModal"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
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

const exampleVideo = {
    "description": "Sintel is an independently produced short film, initiated by the Blender Foundation as a means to further improve and validate the free/open source 3D creation suite Blender. With initial funding provided by 1000s of donations via the internet community, it has again proven to be a viable development model for both open 3D technology as for independent animation film.\nThis 15 minute film has been realized in the studio of the Amsterdam Blender Institute, by an international team of artists and developers. In addition to that, several crucial technical and creative targets have been realized online, by developers and artists and teams all over the world.\nwww.sintel.org",
    "sources": ["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"],
    "subtitle": "By Blender Foundation",
    "thumb": "images/Sintel.jpg",
    "title": "Sintel"
}

const CoursePage = () => {
    const router = useRouter()
    const id = router.query.courseId as string

    const courseQuery = api.courses.getById.useQuery({ id }, {
        enabled: false,
    })
    const userQuery = api.users.getCurrentUser.useQuery(undefined, {
        enabled: false,
    })
    const course = courseQuery.data?.course

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return
        courseQuery.refetch()
        userQuery.refetch()
    }, [id])

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
                                <Typography variant={"secondary"}>Level: {course.level}</Typography>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4 items-center justify-between flex-wrap p-4">
                            {userQuery.data?.user?.courseStatus.some(status => status.courseId === course.id) ? (
                                <Link href={`/my_courses/${userQuery.data?.user?.courseStatus.find(status => status.courseId === course.id)?.courseId}`}>
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
                        <Typography variant={"secondary"}>{course.name}</Typography>
                        <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                    </div>
                    {!course.materialItems[0] ? (
                        <div className="p-4 space-x-4">
                            <Typography>{course.materialItems.length} Materials</Typography>
                            <Typography>-</Typography>
                            <Typography>
                                {course.materialItems[0]!?.manual?.title || "No Material"}
                            </Typography>
                        </div>
                    ) : courseQuery.isLoading ? <Spinner /> : <MaterialShowcase materialItem={course.materialItems[0]} />}
                </div>
            </div>
        </LandingLayout>
    )
}

export default CoursePage