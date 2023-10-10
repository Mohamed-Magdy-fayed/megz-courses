import { BookOpen, Verified } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Typography } from '../ui/Typoghraphy'
import { Button } from '../ui/button'

const OurTeamSection = () => {
    return (
        <div className="grid grid-cols-12">
            {["course", "course", "course"].map((t, i) => (
                <div
                    className="col-span-12 p-4 md:col-span-6 lg:col-span-4"
                >
                    <Card className="">
                        <CardHeader className="p-0">
                            <Skeleton className="w-full h-24 rounded-b-none grid place-content-center">
                                Instructor image
                                <Typography variant={"secondary"}>Jon Doe</Typography>
                            </Skeleton>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <Typography>
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora laudantium dolor aperiam?
                                </Typography>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2 bg-muted/10 whitespace-nowrap">
                                <Typography>Field: </Typography>
                                <Typography className="text-info">English</Typography>
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                            <Button className="gap-2" customeColor={"infoIcon"}>
                                View Courses
                                <BookOpen />
                            </Button>
                            <Button className="gap-2" customeColor={"primaryIcon"}>
                                <Verified />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    )
}

export default OurTeamSection