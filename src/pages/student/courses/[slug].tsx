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
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

const CoursePage = ({ slug }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { status } = useSession()

    const { data: course, refetch } = api.courses.getPreviewBySlug.useQuery({ slug })
    const userQuery = api.users.getCurrentUser.useQuery(undefined, {
        enabled: status === "authenticated",
    })

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => { refetch() }, [slug])

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
                                <Typography className="z-10 text-background select-none" variant={"secondary"}>{course.name}</Typography>
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
                                        target={{
                                            type: "course",
                                            id: course.id,
                                            name: course.name,
                                            groupPrice: course.groupPrice,
                                            privatePrice: course.privatePrice,
                                        }}
                                        open={open}
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
                            <Typography variant={"secondary"} className="text-success">{formatPrice(course.groupPrice)} / Level</Typography>
                        </CardFooter>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-8 flex flex-col items-start lg:col-span-8 md:p-4">
                    <div className="p-4 w-full flex items-center justify-between">
                        <Typography variant={"primary"}>{course.name}</Typography>
                        <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                    </div>
                    {!course.levels[0]?.materialItems[0] ? (
                        <div className="p-4 space-x-4">
                            <Typography>0 Materials</Typography>
                            <Typography>-</Typography>
                            <Typography>
                                No Material
                            </Typography>
                        </div>
                    ) : !course ? <Spinner /> : (
                        <CourseShowcase course={course} />
                    )}
                </div>
            </div>
        </LandingLayout>
    )
}

export const getServerSideProps: GetServerSideProps<{ slug: string }> = async (ctx) => {
    if (typeof ctx.query.slug !== "string") return { notFound: true }

    return {
        props: {
            slug: ctx.query.slug,
        }
    }
}

export default CoursePage
