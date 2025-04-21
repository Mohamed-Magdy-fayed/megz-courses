import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { refundOrder } from "@/server/actions/salesManagement/orders";
import { orderRefundEmail } from "@/server/actions/emails";
import { formatUserForComms } from "@/lib/fcmhelpers"

export const refundsRouter = createTRPCRouter({
    getById: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ ctx, input: { id } }) => {
            const refund = await ctx.prisma.refund.findUnique({
                where: { id },
                include: {
                    order: true,
                    user: true,
                    agent: true,
                },
            });

            if (!refund) throw new TRPCError({ code: "NOT_FOUND", message: "Refund not found" });

            return { refund };
        }),

    getByOrderId: protectedProcedure
        .input(z.object({
            orderId: z.string()
        }))
        .query(async ({ ctx, input: { orderId } }) => {
            const refunds = await ctx.prisma.refund.findMany({
                where: { orderId },
                include: { agent: { include: { user: true } } },
            });

            return { refunds };
        }),

    create: protectedProcedure
        .input(z.object({
            refundId: z.string().optional(),
            refundProof: z.string().optional(),
            refundAmount: z.number(),
            orderId: z.string(),
            userId: z.string(),
        }))
        .mutation(async ({ ctx, input: { orderId, refundAmount, userId, refundId, refundProof } }) => {
            const refund = await ctx.prisma.refund.create({
                data: {
                    refundAmount,
                    refundId,
                    refundProof,
                    order: { connect: { id: orderId } },
                    user: { connect: { id: userId } },
                    agent: { connect: { userId: ctx.session.user.id } },
                },
                include: { order: true, user: true }
            });

            await refundOrder({ orderId })
            await orderRefundEmail({ refund, order: refund.order, student: formatUserForComms(refund.user) })

            return { refund };
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            refundId: z.string().optional(),
            refundProof: z.string().optional(),
            refundAmount: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const refund = await ctx.prisma.refund.update({
                where: { id: input.id },
                data: {
                    refundId: input.refundId,
                    refundProof: input.refundProof,
                    refundAmount: input.refundAmount,
                },
            });

            return { refund };
        }),

    delete: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ ctx, input }) => {
            if (!hasPermission(ctx.session.user, "refunds", "delete")) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action." });
            }

            const refunds = await ctx.prisma.refund.deleteMany({
                where: { id: { in: input } },
            });

            return { refunds };
        }),
});
