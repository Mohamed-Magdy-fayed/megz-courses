import { formatPrice } from '@/lib/utils'
import { Copy, Printer, Home, ExternalLink } from 'lucide-react'
import { FC, useMemo, useRef } from 'react'
import { Typography } from '../../../ui/Typoghraphy'
import { Card, CardHeader, CardContent, CardFooter } from '../../../ui/card'
import { TableCaption, TableBody, TableRow, TableCell, Table } from '../../../ui/table'
import { useToast } from '../../../ui/use-toast'
import { Button } from '../../../ui/button'
import Link from 'next/link'
import { api } from '@/lib/api'
import { validOrderStatusesColors } from '@/lib/enumColors'
import Spinner from '@/components/ui/Spinner'
import WrapWithTooltip from '@/components/ui/wrap-with-tooltip'
import { SeverityPill } from '@/components/ui/SeverityPill'

interface OrderReceiptProps {
    orderNumber: string;
    adminView: boolean;
}

const OrderReceipt: FC<OrderReceiptProps> = ({ orderNumber, adminView }) => {
    const { toastSuccess } = useToast()

    const { data: orderData, isLoading, isError, error } = api.orders.getByOrderNumberPublic.useQuery({ orderNumber })

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

    const color = useMemo(() => validOrderStatusesColors(orderData?.order?.status || "Pending"), [])

    if (isLoading) return <Spinner />
    if (isError) return <Typography>{error.message}</Typography>
    if (!orderData.order) return null

    return (
        <Card ref={printRef} className="max-w-4xl mx-auto">
            <CardHeader>
                Details
            </CardHeader>
            <CardContent className='printable'>
                <Table>
                    <TableCaption>
                        Order Number: {orderData.order.orderNumber}
                    </TableCaption>
                    <TableBody>
                        <TableRow>
                            <TableCell>Name:</TableCell>
                            <TableCell className="text-right">{orderData.order.user.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Email:</TableCell>
                            <TableCell className="text-right">{orderData.order.user.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Phone:</TableCell>
                            <TableCell className="text-right">{orderData.order.user.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Address:</TableCell>
                            <TableCell className="text-right">
                                {orderData.order.user.address?.street}{" "}
                                {orderData.order.user.address?.city}{" "}
                                {orderData.order.user.address?.state}{" "}
                                {orderData.order.user.address?.country}{" "}
                            </TableCell>
                        </TableRow>
                        {orderData.order.paymentIntentId ? (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Payment ID:</TableCell>
                                <TableCell className="flex items-center justify-between gap-2">
                                    <Typography className="text-right truncate ml-auto max-w-[35vw] md:max-w-[50vw] lg:max-w-[65vw]">{orderData.order.paymentIntentId}</Typography>
                                    <WrapWithTooltip text="Copy">
                                        <Button onClick={() => handleCopy(orderData.order?.paymentIntentId!)} variant={"icon"} customeColor={"primaryIcon"}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </WrapWithTooltip>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Order Status:</TableCell>
                                <TableCell className="text-right justify-end flex items-center">
                                    <SeverityPill className='p-2' color={color}>
                                        {orderData.order.status}
                                    </SeverityPill>
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Product:</TableCell>
                            <TableCell className="text-right">
                                {orderData.order.course?.name || orderData.order.product?.name}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="whitespace-nowrap flex items-center gap-2">
                                {orderData.order.course?.name || orderData.order.product?.name}
                                <WrapWithTooltip text="View course">
                                    <Link href={`/student/my_courses/${orderData.order.course?.slug}`} target='_blank'>
                                        <ExternalLink className='w-4 h-4 text-info' />
                                    </Link>
                                </WrapWithTooltip>
                            </TableCell>
                            <TableCell className="text-right">
                                {formatPrice(orderData.order.amount)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Payment Amount:</TableCell>
                            <TableCell className="text-right">
                                {formatPrice(orderData.order.amount!)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="whitespace-nowrap">Status:</TableCell>
                            <TableCell className="text-right">
                                <SeverityPill className='w-fit ml-auto' color={color}>
                                    {orderData.order.status}
                                </SeverityPill>
                            </TableCell>
                        </TableRow>
                        {orderData.order.refundRequester && (
                            <TableRow>
                                <TableCell className="whitespace-nowrap">Refunded By:</TableCell>
                                <TableCell className="text-right">
                                    Refunded By: {orderData.order.refundRequester}
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