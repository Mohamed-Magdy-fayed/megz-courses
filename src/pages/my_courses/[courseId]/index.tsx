import Spinner from "@/components/Spinner"
import LearningLayout from "@/components/LearningLayout/LearningLayout"
import { Typography } from "@/components/ui/Typoghraphy"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FullCourseType } from "@/lib/PrismaFullTypes"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { BookMinus, BookOpen, BookOpenCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect } from "react"

const CoursePage = () => {
    const router = useRouter()
    const id = router.query.courseId as string

    const courseQuery = api.courses.getById.useQuery({ id }, {
        enabled: false,
    })
    const userQuery = api.users.getCurrentUser.useQuery(undefined, {
        enabled: false,
    })
    const course: FullCourseType | undefined | null = courseQuery.data?.course

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
        <LearningLayout>
            <div className="flex flex-col items-start md:p-4">
                <div className="p-4 w-full flex items-center justify-between">
                    <Typography variant={"secondary"}>{course.name}</Typography>
                    <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                </div>
                {!course.materialItems[0]
                    ? (
                        <div className="p-4 space-x-4">
                            <Typography>{course.materialItems.length} Materials</Typography>
                            <Typography>-</Typography>
                            <Typography>
                                {course.materialItems[0]!?.title || "No Material"}
                            </Typography>
                        </div>
                    )
                    : courseQuery.isLoading
                        ? <Spinner />
                        : (
                            <Card className="w-full max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle>
                                        Course Content
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible>
                                        {course.materialItems.map((item, i) => (
                                            <AccordionItem key={item.id} value={item.id}>
                                                <AccordionTrigger>
                                                    <Typography>Session {i + 1}: {item.title}</Typography>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="flex items-center w-full justify-around">
                                                        <Link
                                                            className={
                                                                cn(
                                                                    !item.evaluationForms.find(form => form.type === "quiz")?.id && "pointer-events-none",
                                                                    !userQuery.data?.user?.zoomGroups.some(group => group.zoomSessions.some(session => session.materialItemId === item.id)) && "pointer-events-none",
                                                                )
                                                            }
                                                            href={`/my_courses/${id}/quiz/${item.evaluationForms.find(form => form.type === "quiz")?.id}`}
                                                        >
                                                            <Button
                                                                disabled={
                                                                    !item.evaluationForms.find(form => form.type === "quiz")?.id
                                                                    || !userQuery.data?.user?.zoomGroups.some(group => group.zoomSessions.some(session => session.materialItemId === item.id))
                                                                }
                                                                variant={"outline"}
                                                                customeColor={"infoOutlined"}
                                                            >
                                                                <Typography>
                                                                    Quiz
                                                                </Typography>
                                                                <BookMinus className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/my_courses/${id}/session/${item.id}`}>
                                                            <Button variant={"outline"} customeColor={"primaryOutlined"}>
                                                                <Typography>
                                                                    Session content
                                                                </Typography>
                                                                <BookOpen className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            className={
                                                                cn(
                                                                    !item.evaluationForms.find(form => form.type === "quiz")?.id && "pointer-events-none",
                                                                    !userQuery.data?.user?.zoomGroups.some(group => group.zoomSessions.some(session => session.materialItemId === item.id)) && "pointer-events-none",
                                                                )
                                                            }
                                                            href={`/my_courses/${id}/assignment/${item.evaluationForms.find(form => form.type === "assignment")?.id}`}
                                                        >
                                                            <Button
                                                                disabled={
                                                                    !item.evaluationForms.find(form => form.type === "assignment")?.id
                                                                    || !userQuery.data?.user?.zoomGroups.some(group => group.zoomSessions.some(session => session.materialItemId === item.id))
                                                                }
                                                                variant={"outline"}
                                                                customeColor={"successOutlined"}
                                                            >
                                                                <Typography>
                                                                    Assignment
                                                                </Typography>
                                                                <BookOpenCheck className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )
                }
            </div>
        </LearningLayout>
    )
}

export default CoursePage