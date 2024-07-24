import { formatPrice } from '@/lib/utils'
import { Copy, Printer, Home, ExternalLink } from 'lucide-react'
import { FC, useEffect, useRef } from 'react'
import { Typography } from '../ui/Typoghraphy'
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card'
import { TableCaption, TableBody, TableRow, TableCell, Table } from '../ui/table'
import { useToast } from '../ui/use-toast'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { SeverityPill, SeverityPillProps } from '../overview/SeverityPill'
import { Order, SalesOperation, Course, User } from '@prisma/client'
import { api } from '@/lib/api'

interface OrderReceiptProps {
    order: Order & {
        user: User;
        salesOperation: SalesOperation;
        courses: Course[];
    }
    adminView: boolean
}

const OrderReceipt: FC<OrderReceiptProps> = ({ order, adminView }) => {
    const { toastSuccess } = useToast()
    const printRef = useRef<HTMLDivElement>(null);

    const handleCopy = (data: string) => {
        navigator.clipboard.writeText(data)
        toastSuccess("Payment ID copied to the clipboard")
    }

    const handlePrint = () => {
        if (printRef.current) {
            window.print();
        }
    };

    const status = order.status
    const color: SeverityPillProps["color"] =
        status === "cancelled" ? "destructive"
            : status === "refunded" ? "primary"
                : status === "paid" ? "success"
                    : status === "pending" ? "muted" : "destructive"

    const { data: refundedByUserdata, refetch } = api.users.getUserById.useQuery({ id: order.refundRequester || "" }, { enabled: false });

    useEffect(() => {
        if (order.refundRequester) refetch()
    }, [order.refundRequester])

    return (
        <Card ref={printRef} className="max-w-4xl mx-auto">
            <CardHeader>
                Details
            </CardHeader>
            <CardContent className='printable'>
                <Table>
                    <TableCaption>
                        Order Number: {order.orderNumber}
                    </TableCaption>
                    <TableBody>
                        <TableRow>
                            <TableCell>Name:</TableCell>
                            <TableCell className="text-right">{order.user.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Email:</TableCell>
                            <TableCell className="text-right">{order.user.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Phone:</TableCell>
                            <TableCell className="text-right">{order.user.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Address:</TableCell>
                            <TableCell className="text-right">
                                {order.user.address?.street}{" "}
                                {order.user.address?.city}{" "}
                                {order.user.address?.state}{" "}
                                {order.user.address?.country}{" "}
                            </TableCell>
                        </TableRow>
                        {order.paymentId ? (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Payment ID:</TableCell>
                                <TableCell className="flex items-center justify-between gap-2">
                                    <Typography className="text-right truncate ml-auto max-w-[35vw] md:max-w-[50vw] lg:max-w-[65vw]">{order.paymentId}</Typography>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={() => handleCopy(order?.paymentId!)} variant={"icon"} customeColor={"primaryIcon"}>
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
                                        {order.status}
                                    </SeverityPill>
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Courses:</TableCell>
                            <TableCell className="text-right">
                                {order.courses.length}
                            </TableCell>
                        </TableRow>
                        {order.courses.map(course => (
                            <TableRow key={course.id}>
                                <TableCell className="whitespace-nowrap flex items-center gap-2">
                                    {course.name}
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Link href={`/my_courses/${course.id}`} target='_blank'>
                                                <ExternalLink className='w-4 h-4 text-info' />
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            View course
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell className="text-right">
                                    {order?.courseTypes.find(({ id }) => id === course.id)?.isPrivate ? formatPrice(course.privatePrice) : formatPrice(course.groupPrice)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Payment Amount:</TableCell>
                            <TableCell className="text-right">
                                {formatPrice(order.amount!)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Status:</TableCell>
                            <TableCell className="text-right">
                                <SeverityPill className='w-fit ml-auto' color={color}>
                                    {status}
                                </SeverityPill>
                            </TableCell>
                        </TableRow>
                        {refundedByUserdata?.user.email && (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Refunded By:</TableCell>
                                <TableCell className="text-right">
                                    Refunded By: {refundedByUserdata.user.email}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex items-center p-4 justify-center gap-8">
                <Button variant={"icon"} customeColor={"infoIcon"} onClick={() => handlePrint()}>
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