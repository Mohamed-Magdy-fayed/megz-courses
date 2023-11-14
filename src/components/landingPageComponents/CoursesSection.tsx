import { api } from "@/lib/api"
import LandingCourseCard from "../courses/LandingCourseCard"
import { useEffect } from "react"

const CoursesSection = () => {
    const { data, refetch } = api.courses.getLatest.useQuery(undefined, { enabled: false })

    useEffect(() => {
        refetch()
    }, [])

    return (
        <div className="grid grid-cols-12">
            {data?.courses && data.courses.slice(0, 6).map((course, i) => (
                <LandingCourseCard
                    key={course.id}
                    course={course}
                />
            ))}
        </div>
    )
}

export default CoursesSection