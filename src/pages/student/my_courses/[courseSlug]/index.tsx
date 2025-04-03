import LearningLayout from "@/components/pages/LearningLayout/LearningLayout"
import { Typography } from "@/components/ui/Typoghraphy"
import { format } from "date-fns"
import useLoadLearningData from "@/hooks/useLoadLearningData"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { ArrowLeftToLine } from "lucide-react"
import { useRouter } from "next/router"
import Spinner from "@/components/ui/Spinner"
import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout"

const CoursePage = () => {
    const { course, user } = useLoadLearningData()
    const router = useRouter()

    if (!course || !user) return (
        <LandingLayout>
            <Spinner className="mx-auto" />
        </LandingLayout>
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
                <div className="p-4 w-full space-y-4">
                    <Typography variant={"secondary"}>Please select a level to start</Typography>
                    <div className="flex items-center gap-4 p-4 flex-wrap">
                        {course.levels
                            .filter(lvl => user.courseStatus.some(({ courseId, courseLevelId }) => courseId === course.id && courseLevelId === lvl.id))
                            .map(lvl => (
                                <Link key={lvl.id} href={`/student/my_courses/${course.slug}/${lvl.slug}`}>
                                    <Button variant={"outline"} customeColor={"infoOutlined"}>
                                        <ExternalLink className="w-4 h-4" />
                                        <Typography>{lvl.name}</Typography>
                                    </Button>
                                </Link>
                            ))
                        }
                        {course.levels
                            .filter(lvl => user.courseStatus.some(({ courseId, courseLevelId }) => courseId === course.id && courseLevelId === lvl.id)).length === 0 && "No levels for now!"}
                    </div>
                </div>
            </div>
        </LearningLayout>
    )
}

export default CoursePage