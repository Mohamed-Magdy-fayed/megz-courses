import AppLayout from '@/components/pages/adminLayout/AppLayout'
import OrderReceipt from '@/components/admin/salesManagement/orders/OrderReceipt'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

const OrderPage = ({ orderNumber }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <AppLayout>
            <OrderReceipt orderNumber={orderNumber} adminView />
        </AppLayout>
    )
}

export const getServerSideProps: GetServerSideProps<{ orderNumber: string }> = async (ctx) => {
    const orderNumber = ctx.query.orderNumber
    if (typeof orderNumber !== "string") return { notFound: true }

    return {
        props: {
            orderNumber,
        }
    }
}

export default OrderPage