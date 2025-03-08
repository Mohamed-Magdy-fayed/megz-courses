import OrderPayments from '@/components/admin/salesManagement/orders/OrderPayments'
import OrderRefunds from '@/components/admin/salesManagement/orders/OrderRefunds'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatPrice } from '@/lib/utils'
import { EyeIcon } from 'lucide-react'
import { useState } from 'react'

export default function TransactionsModal({ orderId, remainingAmount }: { remainingAmount: number; orderId: string; }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="p-0 px-2 h-fit w-full" customeColor={"infoIcon"}>View <EyeIcon size={20} className="ml-1" /></Button>
            <Modal
                title={`Remaining amount: ${formatPrice(remainingAmount)}`}
                description=''
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                children={(
                    <Tabs id={`order${orderId}trx`} defaultValue="payments">
                        <TabsList className="w-full">
                            <TabsTrigger value="payments">Payments</TabsTrigger>
                            <TabsTrigger value="refunds">Refunds</TabsTrigger>
                        </TabsList>
                        <TabsContent value="payments">
                            <OrderPayments orderId={orderId} />
                        </TabsContent>
                        <TabsContent value="refunds">
                            <OrderRefunds orderId={orderId} />
                        </TabsContent>
                    </Tabs>
                )}
            />
        </>
    )
}
