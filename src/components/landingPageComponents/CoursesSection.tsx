import { api } from "@/lib/api"
import LandingCourseCard from "../courses/LandingCourseCard"
import { useEffect } from "react"
import Spinner from "../Spinner"

const CoursesSection = () => {
    const { data, isLoading, refetch } = api.courses.getLatest.useQuery(undefined, { enabled: false })

    useEffect(() => {
        refetch()
    }, [])

    return (
        <div className="grid grid-cols-12">
            {isLoading && <div className="col-span-12 p-4 flex justify-center items-center"><Spinner /></div>}
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