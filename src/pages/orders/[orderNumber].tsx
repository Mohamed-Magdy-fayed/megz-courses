import Spinner from '@/components/Spinner'
import AppLayout from '@/components/layout/AppLayout'
import OrderReceipt from '@/components/orders/OrderReceipt'
import { api } from '@/lib/api'
import { useRouter } from 'next/router'

const OrderPage = () => {
    const router = useRouter()
    const orderNumber = router.query.orderNumber as string

    const orderQuery = api.orders.getByOrderNumber.useQuery({ orderNumber })

    return (
        <AppLayout>
            {!orderNumber || !orderQuery.data?.order ? (
                <div className='w-full h-full grid place-content-center'>
                    <Spinner />
                </div>
            ) : (
                <OrderReceipt order={orderQuery.data.order} adminView />
            )}
        </AppLayout>
    )
}

export default OrderPage