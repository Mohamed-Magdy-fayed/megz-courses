import { useEffect, useState } from 'react'
import { Course } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { BookOpen } from 'lucide-react'
import { Typography } from '@/components/ui/Typoghraphy'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { useSession } from 'next-auth/react'

const LandingCourseCard = ({ course }: {
    course: Course & {
        _count: {
            levels: number;
        };
    }
}) => {
    const imageUrl = !course.image ? "" : `url(${course.image})`
    const [open, setOpen] = useState(false)
    const { data: sessionData } = useSession()

    const userQuery = api.users.getCurrentUser.useQuery(undefined, { enabled: false })

    useEffect(() => {
        if (!sessionData?.user) return
        userQuery.refetch()
    }, [])

    return (
        <div
            key={course.id}
            className="w-full col-span-12 p-4 md:col-span-6 lg:col-span-4"
        >
            <Card className="h-full flex flex-col rounded-md overflow-hidden">
                <CardHeader className="p-0">
                    {course.image ? (
                        <div
                            style={{ backgroundImage: imageUrl }}
                            className={cn("grid place-content-center isolate after:content after:absolute after:inset-0 after:bg-muted/40 w-full h-24 rounded-b-none rounded-t-md relative bg-cover bg-center")}
                        >
                            <Typography variant={"secondary"} className="text-background z-10">{course.name}</Typography>
                        </div>
                    ) : (
                        <Skeleton className="w-full h-24 rounded-b-none grid place-content-center">
                            <Typography variant={"secondary"}>{course.name}</Typography>
                        </Skeleton>
                    )}
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-grow flex-col flex justify-between">
                    <div>
                        <Typography>
                            {course.description || "No description"}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-2 px-4 py-2 bg-muted/10 whitespace-nowrap">
                        <Typography >{formatPrice(course.groupPrice)} / Level</Typography>
                        <Typography className="text-success text-end">{course._count.levels} Levels</Typography>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Link href={`/student/courses/${course.slug}`}>
                        <Button className="gap-2" customeColor={"infoIcon"}>
                            View
                            <BookOpen />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

export default LandingCourseCard