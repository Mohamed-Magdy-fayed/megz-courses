import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { hasPermission } from "@/server/permissions";
import { payOrder } from "@/server/actions/salesManagement/orders";
import { orderPaymentEmail } from "@/server/actions/emails";
import { ROOT_EMAIL } from "@/server/constants";
import { formatUserForComms } from "@/lib/fcmhelpers"

export const paymentsRouter = createTRPCRouter({
    getById: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({ ctx, input: { id } }) => {
            const payment = await ctx.prisma.payment.findUnique({
                where: { id },
            });

            return { payment };
        }),
    getByOrderId: protectedProcedure
        .input(z.object({
            orderId: z.string()
        }))
        .query(async ({ ctx, input: { orderId } }) => {
            const payments = await ctx.prisma.payment.findMany({
                where: { orderId },
                include: { agent: { include: { user: true } } },
            });

            return { payments };
        }),

    getAll: protectedProcedure
        .query(async ({ ctx }) => {
            const payments = await ctx.prisma.payment.findMany();

            return { payments };
        }),

    // generateLink: protectedProcedure
    //     .input(generateLinkSchema)
    //     .mutation(async ({ input: { orderNumber, paymentAmount }, ctx }) => {
    //         try {
    //             const order = await ctx.prisma.order.findUnique({
    //                 where: { orderNumber },
    //                 include: { course: true, product: true, user: true }
    //             })
    //             if (!order) throw new TRPCError({ code: "BAD_REQUEST", message: "Incorrect order number!" })

    //             const name = order.product?.name || order.course?.name || ""
    //             const description = order.product?.description || order.course?.description || undefined

    //             const paymentLink = await generatePaymentLink(paymentAmount, `${orderNumber}-${new Date().getMilliseconds()}`, name, description)

    //             return { paymentLink };
    //         } catch (error) {
    //             throw new TRPCError(getTRPCErrorFromUnknown(error))
    //         }
    //     }),
    selfPayment: publicProcedure
        .input(z.object({
            paymentId: z.string(),
            paymentAmount: z.number(),
            orderNumber: z.string(),
        }))
        .mutation(async ({ input: { orderNumber, paymentAmount, paymentId }, ctx }) => {
            const paymentExists = await ctx.prisma.payment.findMany({ where: { paymentId } })
            if (paymentExists.length > 0) return { payment: null }

            const order = await ctx.prisma.order.findFirst({ where: { orderNumber } })
            if (!order) throw new TRPCError({ code: "BAD_REQUEST", message: "Order not found!" })
            const rootUser = await ctx.prisma.user.findUnique({ where: { email: ROOT_EMAIL }, include: { SalesAgent: true } })
            if (!rootUser?.SalesAgent?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Root agent not found!" })

            const payment = await ctx.prisma.payment.create({
                data: {
                    paymentAmount,
                    paymentId,
                    order: { connect: { orderNumber } },
                    user: { connect: { id: order.userId } },
                    agent: { connect: { id: rootUser.SalesAgent.id } },
                },
                include: { order: { include: { payments: true, refunds: true } }, user: true }
            });

            if (!payment.order) throw new TRPCError({ code: "BAD_REQUEST", message: "No order for this payment!" })

            await payOrder({ orderId: payment.order.id })

            await orderPaymentEmail({
                order: payment.order, payment, student: formatUserForComms(payment.user),
                remainingAmount: payment.order.amount - payment.order.payments.reduce((a, b) => a + b.paymentAmount, 0) + payment.order.refunds.reduce((a, b) => a + b.refundAmount, 0)
            })

            return { payment };
        }),
    create: protectedProcedure
        .input(z.object({
            paymentId: z.string().optional(),
            paymentProof: z.string().optional(),
            paymentAmount: z.number(),
            orderNumber: z.string(),
            userId: z.string().optional(),
        }))
        .mutation(async ({ input: { orderNumber, paymentAmount, userId, paymentId, paymentProof }, ctx }) => {
            if (!!paymentId) {
                const paymentExists = await ctx.prisma.payment.findMany({ where: { paymentId } })
                if (paymentExists.length > 0) return { payment: null }
            }

            if (!userId) {
                userId = (await ctx.prisma.user.findFirst({ where: { orders: { some: { orderNumber } } } }))?.id
            }
            if (!userId) throw new TRPCError({ code: "BAD_REQUEST", message: "User not found!" })

            const payment = await ctx.prisma.payment.create({
                data: {
                    paymentAmount,
                    paymentId,
                    paymentProof,
                    order: { connect: { orderNumber } },
                    user: { connect: { id: userId } },
                    agent: { connect: { userId: ctx.session.user.id } },
                },
                include: { order: { include: { payments: true, refunds: true } }, user: true }
            });

            if (!payment.order) throw new TRPCError({ code: "BAD_REQUEST", message: "No order for this payment!" })

            await payOrder({ orderId: payment.order.id })

            await orderPaymentEmail({
                order: payment.order, payment, student: formatUserForComms(payment.user),
                remainingAmount: payment.order.amount - payment.order.payments.reduce((a, b) => a + b.paymentAmount, 0) + payment.order.refunds.reduce((a, b) => a + b.refundAmount, 0)
            })

            return { payment };
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            paymentId: z.string().optional(),
            paymentProof: z.string().optional(),
            paymentAmount: z.number().optional(),
            orderId: z.string().optional(),
            userId: z.string().optional(),
            agentId: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id, ...data } = input;
            const payment = await ctx.prisma.payment.update({
                where: { id },
                data,
            });

            return { payment };
        }),

    delete: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "payments", "delete")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" });
            }

            const payments = await ctx.prisma.payment.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { payments };
        }),
});