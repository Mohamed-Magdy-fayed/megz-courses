import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import LoginModal from "@/components/modals/LoginModal"
import OralTestCard from "@/components/placementTestView/OralTestCard"
import PlacementTestCard from "@/components/placementTestView/PlacementTestCard"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const CoursePlacementTestPage = () => {
    const router = useRouter()
    const slug = router.query.slug as string

    const session = useSession()
    const userId = session.data?.user.id

    const { data } = api.courses.getBySlug.useQuery({ slug }, { enabled: !!slug && !!userId })
    const { data: scheduleData } = api.placementTests.getUserCoursePlacementTest.useQuery({ courseId: data?.course?.id! }, { enabled: !!data?.course?.id && !!userId })

    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        if (session.status === "loading") return
        !userId ? setOpen(true) : setOpen(false)
    }, [session.status])

    if (!userId) return (
        <LandingLayout>
            <LoginModal open={open} setOpen={setOpen} />
        </LandingLayout>
    )

    return (
        <LandingLayout>
            <ConceptTitle className="mb-8">Placement Test</ConceptTitle>
            <div className="w-full grid justify-items-center gap-4 grid-cols-12">
                {!scheduleData?.placementTest ? (
                    <Skeleton className="col-span-12 xl:col-span-4 w-full h-80" />
                ) : (
                    <OralTestCard
                        courseName={data?.course?.name || ""}
                        courseSlug={data?.course?.slug || ""}
                        placementTest={scheduleData.placementTest}
                    />
                )}
                {!data?.course || !scheduleData?.placementTest?.writtenTest || !session.data ? (
                    <Skeleton className="col-span-12 xl:col-span-8 w-full h-80" />
                ) : (
                    <PlacementTestCard
                        course={data.course}
                        courseName={data.course.name}
                        userEmail={session.data.user.email || ""}
                        userId={session.data.user.id}
                        writtenTest={scheduleData.placementTest.writtenTest}
                    />
                )}
            </div>
        </LandingLayout >
    )
}

export default CoursePlacementTestPage
