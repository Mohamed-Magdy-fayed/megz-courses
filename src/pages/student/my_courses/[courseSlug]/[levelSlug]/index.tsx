"use client"

import LearningLayout from "@/components/pages/LearningLayout/LearningLayout"
import { Typography } from "@/components/ui/Typoghraphy"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DisplayError } from "@/components/ui/display-error"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ArrowLeftToLine, BookMinus, BookOpen, BookOpenCheck, FileBadge, MessagesSquareIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"

const LevelPage = () => {
    const router = useRouter()
    const { courseSlug, levelSlug } = router.query as { courseSlug: string, levelSlug: string }

    const { data, isLoading, isError, error } = api.zoomGroups.getZoomGroupByLevel.useQuery({ courseSlug, levelSlug }, { enabled: !!courseSlug && !!levelSlug })

    const { group, course, level, materials, sessions, certificate } = useMemo(() => ({
        group: data?.zoomGroup,
        course: data?.zoomGroup?.course,
        level: data?.zoomGroup?.courseLevel,
        sessions: data?.zoomGroup?.zoomSessions,
        materials: data?.zoomGroup?.courseLevel?.materialItems,
        certificate: data?.zoomGroup?.courseLevel?.certificates[0],
    }), [data?.zoomGroup])

    if (isLoading && !error) {
        return <Skeleton className="w-full h-40" />
    }

    if (isError && error) {
        return <DisplayError message={error.message} />
    }

    if (!group || !course || !level || !materials || !sessions) {
        return <DisplayError message="Seems you're not in a group for this level yet, please try again later!" />
    }

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
                    <Link href={`/student/discussions/${group.id}`}>
                        <Button>Group Discussion<MessagesSquareIcon size={20} className="ml-2" /></Button>
                    </Link>
                </div>
                <div className="w-full">
                    <Card className="w-full mx-auto">
                        <CardHeader>
                            <CardTitle className="flex itecenters-center justify-between">
                                <Typography>{level.name} Content</Typography>
                                <Typography className="text-sm text-primary">{level.materialItems.length} Materials</Typography>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible>
                                {materials.map((item, i) => {
                                    const zoomSession = sessions.find(session => session.materialItemId === item.id)

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
                                                <div className="flex items-center w-full justify-around py-2">
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
                                        <div className="flex items-center w-full justify-around py-2">
                                            <Link
                                                className={
                                                    cn(group?.groupStatus !== "Completed" && "pointer-events-none")
                                                }
                                                href={`/student/my_courses/${course.slug}/${level.slug}/final_test`}
                                            >
                                                <Button
                                                    disabled={group?.groupStatus !== "Completed"}
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
                                                className={cn(!certificate && "pointer-events-none")}
                                                href={`/student/my_courses/${course.slug}/${level.slug}/certificate`}
                                            >
                                                <Button
                                                    disabled={!certificate}
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </LearningLayout >
    )
}

export default LevelPage