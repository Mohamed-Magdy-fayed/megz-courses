import { api } from "@/lib/api"
import LandingCourseCard from "../courses/LandingCourseCard"

const CoursesSection = () => {
    const { data } = api.courses.getLatest.useQuery()

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