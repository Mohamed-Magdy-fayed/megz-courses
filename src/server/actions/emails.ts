import { EmailsWrapper } from "@/components/emails/EmailsWrapper";
import OrderCreatedEmail from "@/components/emails/OrderCreatedEmail";
import PaymentEmail from "@/components/emails/PaymentEmail";
import RefundEmail from "@/components/emails/RefundEmail";
import { env } from "@/env.mjs";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { formatPrice } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { prisma } from "@/server/db";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

export async function orderConfirmationEmail({ prisma, product, student, order }: {
    prisma: PrismaClient;
    product: { name: string; price: number; };
    order: { paymentLink: string; orderNumber: string; orderDate: Date; };
    student: { studentName: string; studentEmail: string; studentPhone: string; };
}) {
    const { name, price } = product
    const { studentPhone, studentEmail, studentName } = student
    const { orderNumber, orderDate, paymentLink } = order
    const formattedPrice = formatPrice(price)

    const html = await EmailsWrapper({
        EmailComp: OrderCreatedEmail,
        prisma,
        props: {
            product: { productName: name, productPrice: formattedPrice },
            customerName: studentName,
            userEmail: studentEmail,
            orderNumber,
            orderAmount: formattedPrice,
            orderCreatedAt: format(orderDate, "PPPp"),
            paymentLink,
            isPaymentEnabled: true,
        }
    })

    await sendZohoEmail({ email: studentEmail, html, subject: `Thanks for your order ${orderNumber}` })
    await sendWhatsAppMessage({
        prisma,
        toNumber: studentPhone,
        type: "OrderPlaced",
        variables: {
            name: studentName,
            orderNumber,
            orderTotal: formattedPrice,
            paymentLink
        },
    })
}

export async function orderPaymentEmail({ payment, student, order, remainingAmount }: {
    payment: { paymentAmount: number; createdAt: Date; };
    order: { orderNumber: string; amount: number; createdAt: Date; };
    student: { name: string; email: string; phone: string; };
    remainingAmount: number;
}) {
    const { paymentAmount, createdAt: paymentCreatedAt } = payment
    const { email, name, phone } = student
    const { orderNumber, createdAt, amount } = order

    const html = await EmailsWrapper({
        EmailComp: PaymentEmail,
        prisma,
        props: {
            email,
            name,
            orderNumber,
            orderDate: format(createdAt, "PPPp"),
            orderTotal: formatPrice(amount),
            paidAmount: formatPrice(paymentAmount),
            paymentDate: format(paymentCreatedAt, "PPPp"),
            remainingAmount,
        }
    })

    await sendZohoEmail({ email, html, subject: `Thanks for your order ${orderNumber}` })
    const { success, error } = await sendWhatsAppMessage({
        prisma,
        toNumber: phone,
        type: "OrderPaid",
        variables: {
            name,
            orderNumber,
            paymentAmount: formatPrice(paymentAmount),
            coursesLink: `${env.NEXTAUTH_URL}student/my_courses`
        },
    })
    return { success, error }
}

export async function orderRefundEmail({ refund, student, order }: {
    refund: { refundAmount: number; createdAt: Date; };
    order: { orderNumber: string; amount: number; createdAt: Date; };
    student: { name: string; email: string; phone: string; };
}) {
    const { refundAmount } = refund
    const { email, name, phone } = student
    const { orderNumber } = order

    const html = await EmailsWrapper({
        EmailComp: RefundEmail,
        prisma,
        props: {
            refundAmount: formatPrice(refundAmount),
            orderNumber,
            name,
        }
    })

    await sendZohoEmail({ email, html, subject: `Thanks for your order ${orderNumber}` })
    const { success, error } = await sendWhatsAppMessage({
        prisma,
        toNumber: phone,
        type: "OrderRefunded",
        variables: {
            name,
            orderNumber,
            refundAmount: formatPrice(refundAmount),
        },
    })
    return { success, error }
}
