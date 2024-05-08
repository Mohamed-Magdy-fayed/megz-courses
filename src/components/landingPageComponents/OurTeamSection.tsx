import { BookOpen, Verified } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Typography } from '../ui/Typoghraphy'
import { Button } from '../ui/button'
import { api } from '@/lib/api'
import { useEffect } from 'react'
import Spinner from '../Spinner'

const OurTeamSection = () => {
    const { data, isLoading, refetch } = api.trainers.getTrainers.useQuery(undefined, { enabled: false })

    useEffect(() => {
        refetch()
    }, [])

    return (
        <div className="grid grid-cols-12">
            {!data?.trainers || isLoading ? <div className='col-span-12 flex justify-center p-4'><Spinner /></div> : data.trainers.slice(0, 3).map((trainer, i) => (
                <div
                    key={trainer.id}
                    className="col-span-12 p-4 md:col-span-6 lg:col-span-4"
                >
                    <Card>
                        <CardHeader className="p-0">
                            {trainer.user.image ? (
                                <div className='w-full h-24 rounded-b-none object-cover bg-center' style={{ backgroundImage: `url(${trainer.user.image})` }}>
                                    <div className='bg-background/60 w-full h-full grid place-content-center'>
                                        <Typography variant={"secondary"} >{trainer.user.name}</Typography>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton className="w-full h-24 rounded-b-none grid place-content-center object-cover bg-center" >
                                    <Typography variant={"secondary"}>{trainer.user.name}</Typography>
                                </Skeleton>
                            )}
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