import { env } from "@/env.mjs"
import { createPaymentIntent } from "@/lib/paymobHelpers";
import { leadsCodeGenerator, orderCodeGenerator } from "@/lib/utils";
import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { isOrderFullyPaid, isOrderFullyRefunded } from "@/server/actions/salesManagement/transactions";
import { prisma } from "@/server/db";

type CourseOrder = { courseId: string; isPrivate: boolean; };
type ProductOrder = { productId: string; }

export async function createProductOrderPayment({ prisma, studentId, productId }: ProductOrder & { prisma: PrismaClient; studentId: string }) {
    const [user, lead, product] = await prisma.$transaction([
        prisma.user.findUnique({ where: { id: studentId }, include: { leads: true } }),
        prisma.lead.findFirst({ where: { userId: studentId } }),
        prisma.product.findUnique({ where: { id: productId }, include: { productItems: true } }),
    ])

    if (!user) throw new Error("Missing user")
    if (!product) throw new Error("Missing a product")
    const amount = product.discountedPrice ?? product.price

    const orderNumber = orderCodeGenerator()
    const intentResponse = await createPaymentIntent(amount, product, user, orderNumber)
    const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

    return {
        paymentLink,
        paymentIntentId: intentResponse.id,
        orderNumber,
        user,
        lead,
        product,
        amount,
    }
}

export async function createCourseOrderPayment({ prisma, studentId, courseId, isPrivate }: CourseOrder & { prisma: PrismaClient; studentId: string }) {
    const [user, lead, course] = await prisma.$transaction([
        prisma.user.findUnique({ where: { id: studentId } }),
        prisma.lead.findFirst({ where: { userId: studentId } }),
        prisma.course.findUnique({ where: { id: courseId } }),
    ])

    if (!user) throw new Error("Missing user")
    if (!course) throw new Error("Missing a course")
    const amount = isPrivate ? course.privatePrice : course.groupPrice

    const orderNumber = orderCodeGenerator()
    const intentResponse = await createPaymentIntent(amount, course, user, orderNumber)
    const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

    return {
        paymentLink,
        paymentIntentId: intentResponse.id,
        orderNumber,
        user,
        lead,
        course,
        amount,
    }
}

export function createOrderNote({ prisma, agentUserId, agentUserName, paymentLink, isPrivate, studentId, productName, studentName }: {
    prisma: PrismaClient; studentId: string; studentName: string; productName: string; isPrivate: boolean;
    agentUserId: string; agentUserName: string; paymentLink: string;
}) {
    return prisma.userNote.create({
        data: {
            sla: 0,
            status: "Closed",
            title: `An Order Placed by ${agentUserName}`,
            type: "Info",
            createdForStudent: { connect: { id: studentId } },
            messages: [{
                message: `An order was placed by ${agentUserName} for Student ${studentName} regarding product ${productName} for a ${isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                updatedAt: new Date(),
                updatedBy: "System"
            }],
            createdByUser: { connect: { id: agentUserId } },
        }
    })
}

export async function createQuickOrderUserLead({ prisma, studentName, studentEmail, studentPhone, agentUserId }: {
    prisma: PrismaClient; studentEmail: string; studentName: string; studentPhone: string; agentUserId: string;
}) {
    const password = "@P" + randomUUID().toString().split("-")[0] as string;
    const hashedPassword = await bcrypt.hash(password, 10)

    const lead = await prisma.lead.create({
        data: {
            code: leadsCodeGenerator(),
            isAssigned: true,
            isAutomated: true,
            isReminderSet: false,
            source: "Manual",
            email: studentEmail,
            phone: studentPhone,
            name: studentName,
            assignee: { connect: { userId: agentUserId } },
            leadStage: { connect: { defaultStage: "Converted" } },
            labels: { connectOrCreate: { where: { value: "Quick order" }, create: { value: "Quick order" } } },
            user: {
                create: {
                    email: studentEmail,
                    phone: studentPhone,
                    name: studentName,
                    hashedPassword,
                    emailVerified: new Date(),
                    userRoles: ["Student"],
                }
            }
        },
        select: { id: true, user: { select: { id: true } } }
    })

    if (!lead.user?.id) throw new Error("Failed to create the new user!")

    return {
        leadId: lead.id,
        studentId: lead.user.id,
        password,
    }
}

export async function payOrder({ orderId }: { orderId: string; }) {
    if (await isOrderFullyPaid({ orderId })) {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "Paid",
                courseStatuses: { updateMany: { where: {}, data: { status: "OrderPaid" } } }
            },
        })
    }
}

export async function refundOrder({ orderId }: { orderId: string; }) {
    if (await isOrderFullyRefunded({ orderId })) {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "Refunded",
                courseStatuses: { updateMany: { where: {}, data: { status: "Refunded" } } }
            },
        })
    } else {
        await prisma.order.update({ where: { id: orderId }, data: { status: await isOrderFullyPaid({ orderId }) ? "Paid" : "Pending" } })
    }
}
