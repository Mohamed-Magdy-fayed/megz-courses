import { useEffect, useState } from 'react'
import { Product } from '@prisma/client'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import { BookOpen, BookOpenCheck, BookPlus } from 'lucide-react'
import { Typography } from '@/components/ui/Typoghraphy'
import { Skeleton } from '@/components/ui/skeleton'
import EnrollmentModal from './EnrollmentModal'
import { api } from '@/lib/api'
import { useSession } from 'next-auth/react'

const LandingProductCard = ({ product }: {
    product: Product & {
        _count: {
            orders: number;
            productItems: number;
        };
    }
}) => {
    const imageUrl = !product.image ? "" : `url(${product.image})`
    const [open, setOpen] = useState(false)
    const { data: sessionData } = useSession()

    const userQuery = api.users.getCurrentUser.useQuery(undefined, { enabled: false })

    useEffect(() => {
        if (!sessionData?.user) return
        userQuery.refetch()
    }, [])

    return (
        <div
            key={product.id}
            className="w-full col-span-12 p-4 md:col-span-6 lg:col-span-4"
        >
            <Card className="h-full flex flex-col rounded-md overflow-hidden">
                <CardHeader className="p-0">
                    {product.image ? (
                        <div
                            style={{ backgroundImage: imageUrl }}
                            className={cn("grid place-content-center isolate after:content after:absolute after:inset-0 after:bg-muted/40 w-full h-24 rounded-b-none rounded-t-md relative bg-cover bg-center")}
                        >
                            <Typography variant={"secondary"} className="text-background z-10">{product.name}</Typography>
                        </div>
                    ) : (
                        <Skeleton className="w-full h-24 rounded-b-none grid place-content-center">
                            <Typography variant={"secondary"}>{product.name}</Typography>
                        </Skeleton>
                    )}
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-grow flex-col flex justify-between">
                    <div>
                        <Typography>
                            {product.description || "No description"}
                        </Typography>
                    </div>
                    <div className="grid grid-cols-2 px-4 py-2 bg-muted/10 whitespace-nowrap">
                        <Typography>
                            {formatPrice(product.groupPrice)}
                        </Typography>
                        <Typography className="text-success text-end">{product._count.productItems} Items</Typography>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Link href={`/student/products/${product.id}`}>
                        <Button className="gap-2" customeColor={"infoIcon"}>
                            View
                            <BookOpen />
                        </Button>
                    </Link>
                    <EnrollmentModal
                        target={{
                            id: product.id,
                            name: product.name,
                            privatePrice: product.privatePrice,
                            groupPrice: product.groupPrice,
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
                </CardFooter>
            </Card>
        </div>
    )
}

export default LandingProductCard