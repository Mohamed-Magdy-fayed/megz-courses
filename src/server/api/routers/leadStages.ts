import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validDefaultStages } from "@/lib/enumsTypes";

export const leadStagesRouter = createTRPCRouter({
    getLeadStages: protectedProcedure
        .query(async ({ ctx }) => {
            let stages = await ctx.prisma.leadStage.findMany({
                include: { leads: { include: { assignee: { include: { user: true } } } } },
                orderBy: { order: "asc" },
            });

            if (stages.length === 0) {
                await ctx.prisma.leadStage.createMany({
                    data: validDefaultStages.map((s, i) => ({ name: s, defaultStage: s, order: i + 1 })),
                })

                stages = await ctx.prisma.leadStage.findMany({
                    include: { leads: { include: { assignee: { include: { user: true } } } } }
                });
            }

            return { stages };
        }),
    createLeadStage: protectedProcedure
        .input(
            z.object({
                name: z.string(),
            })
        )
        .mutation(async ({ input: { name }, ctx }) => {
            const currentConvertedStageOrder = (await ctx.prisma.leadStage.findFirst({ where: { defaultStage: "Converted" } }))?.order
            if (!currentConvertedStageOrder) throw new TRPCError({ code: "BAD_REQUEST", message: "No Default Stages Found!" })

            await ctx.prisma.leadStage.updateMany({ where: { order: { gte: currentConvertedStageOrder } }, data: { order: { increment: 1 } } })

            const leadStage = await ctx.prisma.leadStage.create({
                data: {
                    name,
                    order: currentConvertedStageOrder
                },
            });


            return {
                leadStage,
            };
        }),
    editLeadStage: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string(),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, name },
            }) => {
                const updatedLeadStage = await ctx.prisma.leadStage.update({
                    where: {
                        id: id,
                    },
                    data: {
                        name,
                    },
                });

                return { updatedLeadStage };
            }
        ),
    moveStages: protectedProcedure
        .input(
            z.object({
                newOrders: z.array(z.object({
                    id: z.string(),
                    order: z.number(),
                })),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { newOrders },
            }) => {
                const updatedLeadStages = await ctx.prisma.$transaction(newOrders.map(o => (
                    ctx.prisma.leadStage.update({
                        where: { id: o.id },
                        data: { order: o.order },
                    })
                )));

                return { updatedLeadStages };
            }
        ),
    deleteLeadStage: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedLeadStages = await ctx.prisma.leadStage.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedLeadStages };
        }),
});
