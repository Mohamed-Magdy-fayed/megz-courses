import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";

export const leadStagesRouter = createTRPCRouter({
    getLeadStages: protectedProcedure
        .query(async ({ ctx }) => {
            const leads = await ctx.prisma.lead.findMany()
            const emails = leads.map(l => l.email).filter(l => l !== null)
            const phones = leads.map(l => l.phone).filter(l => l !== null)

            const usersWithEamil = await ctx.prisma.user.findMany({ where: { email: { in: emails } } })
            const usersWithPhone = await ctx.prisma.user.findMany({ where: { phone: { in: phones } } })

            await ctx.prisma.lead.updateMany({
                where: {
                    OR: [
                        { email: { in: usersWithEamil.map(u => u.email).filter(l => l !== null) } },
                        { phone: { in: usersWithPhone.map(u => u.phone).filter(l => l !== null) } },
                    ]
                },
                data: {
                    isInvalid: true,
                }
            })

            const stages = await ctx.prisma.leadStage.findMany({
                include: {
                    leads: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            labels: true,
                            assignee: { include: { user: true } },
                            notes: true,
                            leadStage: true,
                            orders: true,
                        }
                    }
                },
                orderBy: { order: "asc" },
            });

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
            if (!hasPermission(ctx.session.user, "leadStages", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
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
