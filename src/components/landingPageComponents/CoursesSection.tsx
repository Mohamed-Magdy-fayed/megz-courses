import { formatPrice } from "@/lib/utils"
import { BookOpen, BookPlus } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Typography } from "../ui/Typoghraphy"
import { Button } from "../ui/button"
import { api } from "@/lib/api"

const CoursesSection = () => {
    const { data } = api.courses.getLatest.useQuery()

    return (
        <div className="grid grid-cols-12">
            {data?.courses && data.courses.map((t, i) => (
                <div
                    key={t.id}
                    className="col-span-12 p-4 md:col-span-6 lg:col-span-4"
                >
                    <Card className="">
                        <CardHeader className="p-0">
                            <Skeleton className="w-full h-24 rounded-b-none grid place-content-center">
                                Course Image
                                <Typography variant={"secondary"}>Course Name</Typography>
                            </Skeleton>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <Typography>
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora laudantium dolor aperiam?
                                </Typography>
                            </div>
                            <div className="grid grid-cols-2 px-4 py-2 bg-muted/10 whitespace-nowrap">
                                <Typography >{formatPrice(9999)}</Typography>
                                <Typography className="text-success">beginner friendly</Typography>
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                            <Button className="gap-2" customeColor={"infoIcon"}>
                                View
                                <BookOpen />
                            </Button>
                            <Button className="gap-2" customeColor={"primaryIcon"}>
                                Enroll
                                <BookPlus />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    )
}


export default CoursesSection