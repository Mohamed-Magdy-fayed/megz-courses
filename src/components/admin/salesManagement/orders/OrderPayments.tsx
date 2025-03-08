import ImageModal from '@/components/admin/salesManagement/modals/ImageModal'
import { DataTable } from '@/components/ui/DataTable'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import React from 'react'

export default function OrderPayments({ orderId }: { orderId: string }) {
    const { data, isLoading, error } = api.payments.getByOrderId.useQuery({ orderId })

    return (
        <DataTable
            sum={{ key: "paymentAmount", label: "Payment Amount" }}
            filters={[{
                key: "agentId", filterName: "Agent", values: data?.payments.map(payment => ({
                    value: payment.agent.id,
                    label: payment.agent.user.name,
                })).filter((item, index, self) => self.findIndex(t => t.value === item.value) === index) || []
            }]}
            isSuperSimple
            skele={isLoading}
            error={error?.message}
            data={data?.payments || []}
            columns={[
                { accessorKey: "paymentId", header: "Payment ID" },
                { accessorKey: "paymentAmount", cell: ({ row }) => formatPrice(row.original.paymentAmount) },
                { accessorKey: "paymentProof", header: "Payment Proof", cell: ({ row }) => row.original.paymentProof && <ImageModal src={row.original.paymentProof} customeColor="info" size="sm" children={"View"} /> },
                { accessorKey: "agentId", cell: ({ row }) => row.original.agent.user.name },
                { accessorKey: "createdAt", header: "Payment Date", cell: ({ row }) => format(row.original.createdAt, "PPp") },
            ]}
            setData={() => { }}
        />
    )
}
