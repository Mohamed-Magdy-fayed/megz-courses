import { prisma } from "@/server/db";

export async function isOrderFullyPaid({ orderId }: { orderId: string; }) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } })
    if (!order) throw new Error("No Order with that ID!")
    return order.amount <= order.payments.reduce((a, b) => a + b.paymentAmount, 0)
}

export async function isOrderFullyRefunded({ orderId }: { orderId: string; }) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true, refunds: true } })
    if (!order) throw new Error("No Order with that ID!")
    return order.payments.reduce((a, b) => a + b.paymentAmount, 0) <= order.refunds.reduce((a, b) => a + b.refundAmount, 0) && !!order.payments[0]
}
