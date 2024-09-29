import Spinner from "@/components/Spinner"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import LoginModal from "@/components/modals/LoginModal"
import OralTestCard from "@/components/placementTestView/OralTestCard"
import PlacementTestCard from "@/components/placementTestView/PlacementTestCard"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlacementTest } from "@/hooks/usePlacementTest"
import { api } from "@/lib/api"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const CoursePlacementTestPage = () => {
    const router = useRouter()
    const slug = router.query.slug as string

    const session = useSession()
    const userId = session.data?.user.id

    const [open, setOpen] = useState<boolean>(false)

    const { courseData, isLoading, scheduleData } = usePlacementTest(slug)

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
                {isLoading ? (
                    <Skeleton className="col-span-12 xl:col-span-4 w-full h-80" />
                ) : !scheduleData?.placementTest ? (
                    <Card className="col-span-12 xl:col-span-4 w-full h-80">
                        <CardHeader>
                            <CardTitle>Oral Test</CardTitle>
                            <CardDescription>You will see your oral test details here</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Not yet scheduled we'll contact you soon!
                        </CardContent>
                    </Card>
                ) : (
                    <OralTestCard
                        courseName={courseData?.course?.name || ""}
                        courseSlug={courseData?.course?.slug || ""}
                        placementTest={scheduleData?.placementTest}
                    />
                )}
                {isLoading ? (
                    <Skeleton className="col-span-12 xl:col-span-8 w-full h-80" />
                ) : !courseData?.course || !session.data ? (
                    <Card className="col-span-12 xl:col-span-4 w-full h-80">
                        <CardHeader>
                            <CardTitle>Placement Test</CardTitle>
                            <CardDescription>This test is not available now, Please try again later!</CardDescription>
                        </CardHeader>
                    </Card>
                ) : courseData?.course && (
                    <PlacementTestCard
                        courseName={courseData.course.name}
                        courseSlug={slug}
                        enabled={!!slug}
                    />
                )}
            </div>
        </LandingLayout >
    )
}

export default CoursePlacementTestPage
