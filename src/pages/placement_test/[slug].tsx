import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import LoginModal from "@/components/modals/LoginModal"
import OralTestCard from "@/components/placementTestView/OralTestCard"
import PlacementTestCard from "@/components/placementTestView/PlacementTestCard"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    const { data: scheduleData, isLoading: isScheduleDataLoading } = api.placementTests.getUserCoursePlacementTest.useQuery({ courseId: data?.course?.id! }, { enabled: !!data?.course?.id && !!userId })
    const { data: writtenTestData, isLoading: isWrittenTestDataLoading } = api.placementTests.getCoursePlacementTest.useQuery({ courseId: data?.course?.id! }, { enabled: !!data?.course?.id && !!userId });

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
                {isScheduleDataLoading ? (
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
                        courseName={data?.course?.name || ""}
                        courseSlug={data?.course?.slug || ""}
                        placementTest={scheduleData.placementTest}
                    />
                )}
                {isWrittenTestDataLoading ? (
                    <Skeleton className="col-span-12 xl:col-span-8 w-full h-80" />
                ) : !data?.course || !writtenTestData?.test || !session.data ? (
                    <Card className="col-span-12 xl:col-span-4 w-full h-80">
                        <CardHeader>
                            <CardTitle>Placement Test</CardTitle>
                            <CardDescription>This test is not available now, Please try again later!</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <PlacementTestCard
                        course={data.course}
                        courseName={data.course.name}
                        userEmail={session.data.user.email || ""}
                        userId={session.data.user.id}
                        writtenTest={writtenTestData.test}
                    />
                )}
            </div>
        </LandingLayout >
    )
}

export default CoursePlacementTestPage
