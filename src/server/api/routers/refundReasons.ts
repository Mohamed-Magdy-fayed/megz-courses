import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const refundReasonsRouter = createTRPCRouter({
    getRefundReasons: protectedProcedure
        .query(async ({ ctx }) => {
            const refundReasons = await ctx.prisma.refundReasons.findMany();

            return { refundReasons };
        }),
    createRefundReason: protectedProcedure
        .input(
            z.object({
                reason: z.string(),
            })
        )
        .mutation(async ({ input: { reason }, ctx }) => {
            const refundReason = await ctx.prisma.refundReasons.create({
                data: {
                    reason,
                },
            });

            return {
                refundReason,
            };
        }),
    editRefundReason: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                reason: z.string(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, reason },
            }) => {
                const updatedRefundReason = await ctx.prisma.refundReasons.update({
                    where: {
                        id: id,
                    },
                    data: {
                        reason,
                    },
                });

                return { updatedRefundReason };
            }
        ),
    deleteRefundReasons: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedRefundReasons = await ctx.prisma.refundReasons.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedRefundReasons };
        }),
});
