import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const leadLabelsRouter = createTRPCRouter({
    getLeadLabels: protectedProcedure
        .query(async ({ ctx }) => {
            const leadLabels = await ctx.prisma.leadLabel.findMany();

            return { leadLabels };
        }),
    searchLeadLabels: protectedProcedure
        .input(z.object({ value: z.string() }))
        .query(async ({ ctx, input: { value } }) => {
            const leadLabels = await ctx.prisma.leadLabel.findMany({
                where: { value: { contains: value } },
            });

            return { leadLabels };
        }),
    createLeadLabel: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                value: z.string(),
            })
        )
        .mutation(async ({ input: { leadId, value }, ctx }) => {
            const leadLabel = await ctx.prisma.leadLabel.create({
                data: {
                    value,
                    leads: { connect: { id: leadId } }
                },
            });

            return {
                leadLabel,
            };
        }),
    connectLeadLabel: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                labelId: z.string(),
            })
        )
        .mutation(async ({ input: { leadId, labelId }, ctx }) => {
            const leadLabel = await ctx.prisma.leadLabel.update({
                where: {
                    id: labelId
                },
                data: {
                    leads: { connect: { id: leadId } }
                },
            });

            return {
                leadLabel,
            };
        }),
    removeLeadLabel: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                labelId: z.string(),
            })
        )
        .mutation(async ({ input: { leadId, labelId }, ctx }) => {
            const leadLabel = await ctx.prisma.leadLabel.update({
                where: {
                    id: labelId
                },
                data: {
                    leads: { disconnect: { id: leadId } }
                },
            });

            return {
                leadLabel,
            };
        }),
    editLeadLabel: protectedProcedure
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
                const updatedLeadLabel = await ctx.prisma.leadLabel.update({
                    where: {
                        id: id,
                    },
                    data: {
                        value,
                    },
                });

                return { updatedLeadLabel };
            }
        ),
    deleteLeadLabels: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedLeadLabels = await ctx.prisma.leadLabel.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedLeadLabels };
        }),
});
