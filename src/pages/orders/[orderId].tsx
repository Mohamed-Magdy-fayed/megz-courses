import Spinner from '@/components/Spinner'
import AppLayout from '@/components/layout/AppLayout'
import OrderReceipt from '@/components/orders/OrderReceipt'
import { useRouter } from 'next/router'

const OrderPage = () => {
    const router = useRouter()
    const id = router.query.orderId

    return (
        <AppLayout>
            {!id || typeof id !== "string" ? (
                <div className='w-full h-full grid place-content-center'>
                    <Spinner />
                </div>
            ) : (
                <OrderReceipt orderId={id} adminView />
            )}
        </AppLayout>
    )
}

export default OrderPage