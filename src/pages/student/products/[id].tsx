import CourseShowcase from "@/components/admin/systemManagement/contentComponents/materials/CourseShowcase"
import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout"
import EnrollmentModal from "@/components/student/courses/EnrollmentModal"
import Spinner from "@/components/ui/Spinner"
import { Typography } from "@/components/ui/Typoghraphy"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { api } from "@/lib/api"
import { cn, formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { BookOpenCheck, BookPlus } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import ProductShowcase from "@/components/admin/systemManagement/contentComponents/materials/ProductShowcase"

const ProductPage = ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const { status } = useSession()

    const { data, refetch } = api.products.getById.useQuery({ id })

    const [open, setOpen] = useState(false)

    useEffect(() => { refetch() }, [id])

    if (!data?.product) return (
        <div className="w-screen h-screen grid place-content-center">
            <Spinner />
        </div>
    )

    return (
        <LandingLayout>
            <div className="grid grid-cols-12 md:gap-4">
                <div className="col-span-12 md:col-span-4 md:order-1 lg:col-span-4 md:p-4">
                    <Card className="overflow-hidden sticky top-4">
                        <CardHeader className="p-0">
                            <div
                                style={{ backgroundImage: `url("${data.product.image}")` || "" }}
                                className={cn("grid px-8 py-20 place-content-center isolate after:content after:absolute after:inset-0 after:bg-muted/40 w-full rounded-b-none relative bg-cover bg-center")}
                            >
                                <Typography className="z-10 text-background select-none" variant={"secondary"}>{data.product.name}</Typography>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <Typography variant={"secondary"}>Description</Typography>
                                <div>{data.product.description}</div>
                            </div>
                            <div>
                                <Typography variant={"secondary"}>Contents: </Typography>
                                <div className="flex gap-2 flex-wrap">
                                    {data.product.productItems.map(item => (
                                        <Typography key={item.id}>{item.course.name} - {item.level?.name}</Typography>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-4 items-center justify-between flex-wrap p-4">
                            <EnrollmentModal
                                target={{
                                    id: data.product.id,
                                    name: data.product.name,
                                    privatePrice: data.product.privatePrice,
                                    groupPrice: data.product.groupPrice,
                                }}
                                open={open}
                                setOpen={setOpen}
                            />
                            <Button
                                onClick={() => setOpen(true)}
                            >
                                <Typography>
                                    Endoll Now!
                                </Typography>
                                <BookPlus />
                            </Button>
                            <Typography>
                                {formatPrice(data.product.groupPrice)}
                            </Typography>
                        </CardFooter>
                    </Card>
                </div>
                <div className="col-span-12 md:col-span-8 flex flex-col items-start lg:col-span-8 md:p-4">
                    <div className="p-4 w-full flex items-center justify-between">
                        <Typography variant={"primary"}>{data.product.name}</Typography>
                        <Typography>Added on {format(data.product.createdAt, "do MMM yyyy")}</Typography>
                    </div>
                    {!data.product.productItems[0] ? (
                        <div className="p-4 space-x-4">
                            <Typography>0 Items</Typography>
                            <Typography>-</Typography>
                            <Typography>
                                No Items
                            </Typography>
                        </div>
                    ) : !data.product ? <Spinner /> : (
                        <ProductShowcase product={data.product} />
                    )}
                </div>
            </div>
        </LandingLayout>
    )
}

export const getServerSideProps: GetServerSideProps<{ id: string }> = async (ctx) => {
    if (typeof ctx.query.id !== "string") return { notFound: true }

    return {
        props: {
            id: ctx.query.id,
        }
    }
}

export default ProductPage
