import LearningLayout from "@/components/pages/LearningLayout/LearningLayout"
import { Typography } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import { DisplayError } from "@/components/ui/display-error"
import GoBackButton from "@/components/ui/go-back"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"

const CoursePage = () => {
    const router = useRouter()
    const courseSlug = router.query.courseSlug as string;

    const { data, isLoading, isError, error } = api.courses.getLearningMenu.useQuery({ courseSlug }, { enabled: !!courseSlug })
    const course = useMemo(() => data?.courseStatues[0]?.course, [data])

    if (isLoading && !error) {
        return <Skeleton className="w-full h-40" />
    }

    if (isError && error) {
        return <DisplayError message={error.message} />
    }

    if (!course) {
        return <DisplayError message={`No course found!`} />
    }

    return (
        <LearningLayout>
            <div className="flex flex-col items-start md:p-4">
                <div className="p-4 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GoBackButton />
                        <Typography variant={"primary"}>{course.name} Course</Typography>
                    </div>
                    <Typography>Added on {format(course.createdAt, "do MMM yyyy")}</Typography>
                </div>
                <div className="p-4 w-full space-y-4">
                    <Typography variant={"secondary"}>Please select a level to start</Typography>
                    <div className="flex items-center gap-4 p-4 flex-wrap">
                        {data.courseStatues
                            .map(status => (
                                <Link key={status.id} href={`/student/my_courses/${course.slug}/${status.level?.slug}`}>
                                    <Button variant={"outline"} customeColor={"infoOutlined"}>
                                        <ExternalLink className="w-4 h-4" />
                                        <Typography>{status.level?.name}</Typography>
                                    </Button>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
        </LearningLayout>
    )
}

export default CoursePage