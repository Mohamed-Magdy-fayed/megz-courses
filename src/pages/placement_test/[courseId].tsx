import Scrollbar from "@/components/Scrollbar"
import Spinner from "@/components/Spinner"
import AppLayout from "@/components/layout/AppLayout"
import FormIfram from "@/components/placementTest/FormIfram"
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const CoursePlacementTestPage = () => {
    const router = useRouter()
    const id = router.query.courseId as string
    const { data } = api.courses.getById.useQuery({ id })
    const { data: sheetData } = api.googleSheets.getSheetData.useQuery({ url: `https://docs.google.com/spreadsheets/d/1JjqwgAiCG0aguecp-ganKADc1tr-IPbC-L6p03-eVyY/edit?resourcekey#gid=1718928846` })

    useEffect(() => {
        console.log(sheetData);
    }, [sheetData])

    if (!data?.course) return <div className="w-full h-full grid place-content-center"><Spinner /></div>

    return (
        <AppLayout>
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
        </AppLayout >
    )
}

export default CoursePlacementTestPage