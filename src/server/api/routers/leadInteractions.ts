import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { validLeadInteractionsType } from "@/lib/enumsTypes";
import { sendMessageToUser } from "@/lib/metaHelpers";
import { hasPermission } from "@/server/permissions";

export const leadInteractionsRouter = createTRPCRouter({
    getLeadInteractions: protectedProcedure
        .query(async ({ ctx }) => {
            const leadInteractions = await ctx.prisma.leadInteraction.findMany({
                include: {
                    customer: true,
                    salesAgent: { include: { user: true } }
                }
            });

            return { leadInteractions };
        }),
    searchLeadInteractions: protectedProcedure
        .input(z.object({ value: z.string() }))
        .query(async ({ ctx, input: { value } }) => {
            const leadInteractions = await ctx.prisma.leadInteraction.findMany({
                where: { description: { contains: value } },
            });

            return { leadInteractions };
        }),
    createLeadInteraction: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                description: z.string(),
                type: z.enum(validLeadInteractionsType),
            })
        )
        .mutation(async ({ input: { leadId, type, description }, ctx }) => {
            const leadInteraction = await ctx.prisma.leadInteraction.create({
                data: {
                    type,
                    description,
                    lead: { connect: { id: leadId } },
                    salesAgent: { connect: { userId: ctx.session.user.id } }
                },
                include: { lead: true }
            });

            if (type === "Chat") {
                const accessToken = (await ctx.prisma.metaClient.findFirst())?.accessToken
                if (!accessToken || !leadInteraction.lead?.metaUserId) return {
                    leadInteraction,
                };
                await sendMessageToUser({ accessToken, metaUserId: leadInteraction.lead?.metaUserId, text: description })
            }

            return {
                leadInteraction,
            };
        }),
    editLeadInteraction: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                description: z.string(),
                type: z.enum(validLeadInteractionsType),
            })
        )
        .mutation(
            async ({
                ctx,
                input: { id, description, type },
            }) => {
                const updatedLeadInteraction = await ctx.prisma.leadInteraction.update({
                    where: {
                        id: id,
                    },
                    data: {
                        description,
                        type,
                    },
                });

                return { updatedLeadInteraction };
            }
        ),
    deleteLeadInteractions: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            const interactions = await ctx.prisma.leadInteraction.findMany({ where: { id: { in: input } }, include: { lead: true } })
            if (!interactions.every(interaction => interaction?.lead && hasPermission(ctx.session.user, "leads", "update", interaction.lead))) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const deletedLeadInteractions = await ctx.prisma.leadInteraction.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedLeadInteractions };
        }),
});
