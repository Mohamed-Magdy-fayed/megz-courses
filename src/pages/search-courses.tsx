import Spinner from "@/components/Spinner"
import EnrollmentModal from "@/components/courses/EnrollmentModal"
import LandingCourseCard from "@/components/courses/LandingCourseCard"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useDebounce from "@/hooks/useDebounce"
import { api } from "@/lib/api"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const Page = () => {
    const initQuery = useRouter().query.query as string
    const [query, setQuery] = useState<string>(initQuery || "")
    const coursesQuery = api.courses.query.useQuery({ query: query }, {
        enabled: false,
    })

    useDebounce(() => coursesQuery.refetch(), 500, [query])

    useEffect(() => {
        if (!initQuery) return
        setQuery(initQuery)
    }, [initQuery])

    return (
        <LandingLayout>
            <div className="p-4 flex items-center justify-center">
                <div className="flex max-w-xl w-full rounded-md [&:has(:focus-visible)]:ring-1 [&:has(:focus-visible)]:ring-primary [&:has(:focus-visible)]:ring-offset-1 overflow-hidden">
                    <Input
                        placeholder="Search Courses"
                        autoComplete="off"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="rounded-none rounded-l-md focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 "
                    />
                    <Button className="rounded-none rounded-r-md">
                        Search
                    </Button>
                </div>
            </div>
            <div>
                {coursesQuery.isLoading ? (
                    <div className="w-full h-full grid place-content-center">
                        <Spinner />
                    </div>
                ) : !coursesQuery.data?.courses || coursesQuery.data.courses.length === 0 ? (
                    <div>
                        No results
                    </div>
                ) : (
                    <div className="grid grid-cols-12">
                        {coursesQuery.data.courses.map(course => (
                            <LandingCourseCard
                                key={course.id}
                                course={course}
                            />
                        ))}
                    </div>
                )}
            </div>
        </LandingLayout>
    )
}

export default Page