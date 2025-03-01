import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { getCurrentTier } from "@/lib/system";

export const paramsRouter = createTRPCRouter({
    getParams: protectedProcedure
        .query(async ({ ctx }) => {
            if (!hasPermission(ctx.session.user, "params", "view")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const params = await ctx.prisma.parameters.findMany();

            return { params };
        }),
    resetParams: protectedProcedure
        .mutation(async ({ ctx }) => {
            if (!hasPermission(ctx.session.user, "params", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const currentParams = await ctx.prisma.parameters.findMany()
            const refundReason = await ctx.prisma.$transaction(
                currentParams
                    ? currentParams.map(p => ctx.prisma.parameters.update({
                        where: { id: p.id },
                        data: { value: "" }
                    }))
                    : []
            )

            return {
                refundReason,
            };
        }),
    editParam: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                value: z.string(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, value },
            }) => {
                if (!hasPermission(ctx.session.user, "params", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
                const updatedParam = await ctx.prisma.parameters.update({
                    where: {
                        id: id,
                    },
                    data: {
                        value,
                    },
                });

                return { updatedParam };
            }
        ),
    deleteParams: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "params", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const deletedParams = await ctx.prisma.parameters.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedParams };
        }),
    getCurrentTier: protectedProcedure
        .query(() => {
            return getCurrentTier()
        })
});
