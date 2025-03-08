import ImageModal from '@/components/admin/salesManagement/modals/ImageModal'
import { DataTable } from '@/components/ui/DataTable'
import { Typography } from '@/components/ui/Typoghraphy'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import React from 'react'

export default function OrderRefunds({ orderId }: { orderId: string }) {
    const { data, isLoading, error } = api.refunds.getByOrderId.useQuery({ orderId })

    return (
        <DataTable
            isSuperSimple
            sum={{ key: "refundAmount", label: "Refund Amount", isNegative: true }}
            filters={[{
                key: "agentId", filterName: "Agent", values: data?.refunds.map(refund => ({
                    value: refund.agent.id,
                    label: refund.agent.user.name,
                })).filter((item, index, self) => self.findIndex(t => t.value === item.value) === index) || []
            }]}
            skele={isLoading}
            error={error?.message}
            data={data?.refunds || []}
            columns={[
                { accessorKey: "refundId", header: "Refund ID" },
                { accessorKey: "refundAmount", cell: ({ row }) => <Typography className="text-destructive">-({formatPrice(row.original.refundAmount)})</Typography> },
                { accessorKey: "refundProof", header: "Refund Proof", cell: ({ row }) => row.original.refundProof && <ImageModal src={row.original.refundProof} customeColor="info" size="sm" children={"View"} /> },
                { accessorKey: "createdAt", header: "Refund Date", cell: ({ row }) => format(row.original.createdAt, "PPp") },
            ]}
            setData={() => { }}
        />
    )
}
