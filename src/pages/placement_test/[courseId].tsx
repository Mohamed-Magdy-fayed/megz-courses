import Spinner from "@/components/Spinner"
import LandingLayout from "@/components/landingPageComponents/LandingLayout"
import FormIfram from "@/components/placementTest/FormIfram"
import { ConceptTitle } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useRouter } from "next/router"

const CoursePlacementTestPage = () => {
    const router = useRouter()
    const id = router.query.courseId as string
    const { data } = api.courses.getById.useQuery({ id })

    if (!data?.course) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <LandingLayout>
            <ConceptTitle className="mb-8">Placement Test (form)</ConceptTitle>
            <div className="w-full grid justify-items-center gap-4 grid-cols-12">
                <FormIfram className="col-span-12 xl:col-span-8" src={data.course.form.split(`src="`)[1]?.split(`" width`)[0]} />
                <Card className="col-span-12 xl:col-span-4 w-full h-fit">
                    <CardHeader>
                        Result
                    </CardHeader>
                    <CardContent>
                        No result yet
                    </CardContent>
                    <CardFooter>
                        <Button>Oral Test</Button>
                    </CardFooter>
                </Card>
            </div>
        </LandingLayout >
    )
}

export default CoursePlacementTestPage