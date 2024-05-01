import { formatPrice } from '@/lib/utils'
import { Copy, Printer, Home } from 'lucide-react'
import { FC } from 'react'
import { Typography } from '../ui/Typoghraphy'
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card'
import { TableCaption, TableBody, TableRow, TableCell, Table } from '../ui/table'
import { useToast } from '../ui/use-toast'
import { Button } from '../ui/button'
import Link from 'next/link'
import { api } from '@/lib/api'
import Spinner from '../Spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { SeverityPill, SeverityPillProps } from '../overview/SeverityPill'

interface OrderReceiptProps {
    orderId: string
    adminView: boolean
}

const OrderReceipt: FC<OrderReceiptProps> = ({ orderId, adminView }) => {
    const { data } = api.orders.getById.useQuery({ id: orderId })
    const { toastSuccess } = useToast()

    const handleCopy = (data: string) => {
        navigator.clipboard.writeText(data)
        toastSuccess("Payment ID copied to the clipboard")
    }

    const color: SeverityPillProps["color"] =
        data?.order?.status === "cancelled" ? "destructive"
            : data?.order?.status === "done" ? "success"
                : data?.order?.status === "paid" ? "info"
                    : "muted"

    if (!data?.order) return (
        <div className="w-full h-full grid place-content-center">
            <Spinner />
        </div>
    )

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                Details
            </CardHeader>
            <CardContent>
                <Table>
                    <TableCaption>
                        Order Number: {data.order.orderNumber}
                    </TableCaption>
                    <TableBody>
                        <TableRow>
                            <TableCell>Name:</TableCell>
                            <TableCell className="text-right">{data.order.user.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Email:</TableCell>
                            <TableCell className="text-right">{data.order.user.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Phone:</TableCell>
                            <TableCell className="text-right">{data.order.user.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Address:</TableCell>
                            <TableCell className="text-right">
                                {data.order.user.address?.street}{" "}
                                {data.order.user.address?.city}{" "}
                                {data.order.user.address?.state}{" "}
                                {data.order.user.address?.country}{" "}
                            </TableCell>
                        </TableRow>
                        {data.order.paymentId ? (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Payment ID:</TableCell>
                                <TableCell className="flex items-center justify-between gap-2">
                                    <Typography className="text-right truncate ml-auto max-w-[35vw] md:max-w-[50vw] lg:max-w-[65vw]">{data.order.paymentId}</Typography>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={() => handleCopy(data.order?.paymentId!)} variant={"icon"} customeColor={"primaryIcon"}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Copy
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Order Status:</TableCell>
                                <TableCell className="text-right justify-end flex items-center">
                                    <SeverityPill className='p-2' color={color}>
                                        {data.order.status}
                                    </SeverityPill>
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Courses:</TableCell>
                            <TableCell className="text-right">
                                {data.order.courses.length}
                            </TableCell>
                        </TableRow>
                        {data.order.courses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="whitespace-nowrap">{course.name}</TableCell>
                                <TableCell className="text-right">
                                    {formatPrice(course.price)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Payment Amount:</TableCell>
                            <TableCell className="text-right">
                                {formatPrice(data.order.amount!)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex items-center p-4 justify-center gap-8">
                <Button variant={"icon"} customeColor={"infoIcon"}>
                    <Printer />
                </Button>
                <Link href={'/'}>
                    <Button variant={"icon"} customeColor={"primaryIcon"}>
                        <Home />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

export default OrderReceipt