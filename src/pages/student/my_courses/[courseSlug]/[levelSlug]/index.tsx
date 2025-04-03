import LearningLayout from "@/components/pages/LearningLayout/LearningLayout"
import { Typography } from "@/components/ui/Typoghraphy"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeftToLine, BookMinus, BookOpen, BookOpenCheck, FileBadge } from "lucide-react"
import Link from "next/link"
import useLoadLearningData from "@/hooks/useLoadLearningData"
import Spinner from "@/components/ui/Spinner"
import { useRouter } from "next/router"
import { useMemo } from "react"

const LevelPage = () => {
    const router = useRouter()
    const { course, level, levelSlugs, user } = useLoadLearningData()

    const courseStatus = useMemo(() => user?.courseStatus.find(cs => cs.courseId === course?.id && cs.courseLevelId === level?.id), [user])

    if (!course || !level || !user) return (
        <LearningLayout>
            <Spinner />
        </LearningLayout>
    )

    return (
        <LearningLayout>
            <div className="flex flex-col items-start md:p-4">
                <div className="p-4 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button onClick={() => router.back()} variant={"icon"} customeColor={"infoIcon"}>
                            <ArrowLeftToLine className="w-4 h-4" />
                        </Button>
                        <Typography variant={"primary"}>{course.name} Course</Typography>
                    </div>
                    <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                </div>
                {course.levels.every(lvl => !levelSlugs?.includes(lvl.slug)) ? "No Materials Available Yet!"
                    : (
                        <div className="w-full">
                            <div className="p-4 space-x-4">
                                <Typography>{level.materialItems.length} Materials</Typography>
                            </div>
                            <Card className="w-full mx-auto">
                                <CardHeader>
                                    <CardTitle>
                                        {level.name} Content
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {!courseStatus || courseStatus.status === "Waiting" ? (
                                        <>
                                            Group not started yet
                                        </>
                                    ) : (
                                        <Accordion type="single" collapsible>
                                            {level.materialItems.map((item, i) => {
                                                const zoomSession = user.zoomGroups.map(group =>
                                                    group.zoomSessions.find(session => session.materialItemId === item.id)?.materialItemId === item.id
                                                        ? group.zoomSessions.find(session => session.materialItemId === item.id)
                                                        : null).filter(s => s !== null)[0]

                                                return (
                                                    <AccordionItem key={item.id} value={item.id}>
                                                        <AccordionTrigger>
                                                            <div className="flex items-center gap-8 justify-between w-full whitespace-nowrap">
                                                                <Typography>Session {i + 1}: {item.title}</Typography>
                                                                <Typography>
                                                                    Session Date: {zoomSession?.sessionDate
                                                                        ? format(zoomSession.sessionDate, "PPPPp")
                                                                        : "Not started yet!"
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="flex items-center w-full justify-around">
                                                                <Link
                                                                    className={
                                                                        cn(zoomSession?.sessionStatus === "Scheduled" && "pointer-events-none")
                                                                    }
                                                                    href={`/student/my_courses/${course.slug}/${level.slug}/Quiz/${item.slug}`}
                                                                >
                                                                    <Button
                                                                        disabled={zoomSession?.sessionStatus === "Scheduled"}
                                                                        variant={"outline"}
                                                                        customeColor={"infoOutlined"}
                                                                    >
                                                                        <Typography>
                                                                            Quiz
                                                                        </Typography>
                                                                        <BookMinus className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Link
                                                                    className={
                                                                        cn((zoomSession?.sessionStatus && ["Starting", "Scheduled"].includes(zoomSession.sessionStatus)) && "pointer-events-none",)
                                                                    }
                                                                    href={`/student/my_courses/${course.slug}/${level.slug}/session/${item.slug}`}
                                                                >
                                                                    <Button
                                                                        disabled={(zoomSession?.sessionStatus && ["Starting", "Scheduled"].includes(zoomSession.sessionStatus))}
                                                                        variant={"outline"}
                                                                        customeColor={"primaryOutlined"}
                                                                    >
                                                                        <Typography>
                                                                            Session content
                                                                        </Typography>
                                                                        <BookOpen className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Link
                                                                    className={
                                                                        cn(zoomSession?.sessionStatus !== "Completed" && "pointer-events-none",)
                                                                    }
                                                                    href={`/student/my_courses/${course.slug}/${level.slug}/Assignment/${item.slug}`}
                                                                >
                                                                    <Button
                                                                        disabled={zoomSession?.sessionStatus !== "Completed"}
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
                                                )
                                            })}
                                            <AccordionItem value="course-completion">
                                                <AccordionTrigger>
                                                    Course Completion
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="flex items-center w-full justify-around">
                                                        <Link
                                                            className={
                                                                cn(!user.zoomGroups.some(group => group.courseId === course.id && group.zoomSessions.every(session => session.sessionStatus === "Completed")) && "pointer-events-none")
                                                            }
                                                            href={`/student/my_courses/${course.slug}/${level.slug}/final_test`}
                                                        >
                                                            <Button
                                                                disabled={!user.zoomGroups.some(group => group.courseId === course.id && group.zoomSessions.every(session => session.sessionStatus === "Completed"))}
                                                                variant={"outline"}
                                                                customeColor={"destructiveOutlined"}
                                                            >
                                                                <Typography>
                                                                    Final Test
                                                                </Typography>
                                                                <BookOpenCheck className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            className={
                                                                cn(
                                                                    !user.certificates.find(cert => cert.courseLevel?.slug === level?.slug)?.id && "pointer-events-none"
                                                                )
                                                            }
                                                            href={`/student/my_courses/${course.slug}/${level.slug}/certificate`}
                                                        >
                                                            <Button
                                                                disabled={
                                                                    !user.certificates.find(cert => cert.courseLevel?.slug === level?.slug)?.id
                                                                }
                                                                variant={"outline"}
                                                                customeColor={"successOutlined"}
                                                            >
                                                                <Typography>
                                                                    Certificate
                                                                </Typography>
                                                                <FileBadge className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
            </div>
        </LearningLayout>
    )
}

export default LevelPage