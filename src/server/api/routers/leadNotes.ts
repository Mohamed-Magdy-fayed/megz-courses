import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";

export const leadNotesRouter = createTRPCRouter({
    getLeadNotes: protectedProcedure
        .query(async ({ ctx }) => {
            const leadNotes = await ctx.prisma.leadNote.findMany();

            return { leadNotes };
        }),
    searchLeadNotes: protectedProcedure
        .input(z.object({ value: z.string() }))
        .query(async ({ ctx, input: { value } }) => {
            const leadNotes = await ctx.prisma.leadNote.findMany({
                where: { value: { contains: value } },
            });

            return { leadNotes };
        }),
    createLeadNote: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                value: z.string(),
            })
        )
        .mutation(async ({ input: { leadId, value }, ctx }) => {
            const leadNote = await ctx.prisma.leadNote.create({
                data: {
                    value,
                    leads: { connect: { id: leadId } }
                },
            });

            return {
                leadNote,
            };
        }),
    connectLeadNote: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                labelId: z.string(),
            })
        )
        .mutation(async ({ input: { leadId, labelId }, ctx }) => {
            const leadNote = await ctx.prisma.leadNote.update({
                where: {
                    id: labelId
                },
                data: {
                    leads: { connect: { id: leadId } }
                },
            });

            return {
                leadNote,
            };
        }),
    removeLeadNote: protectedProcedure
        .input(
            z.object({
                leadId: z.string(),
                labelId: z.string(),
            })
        )
        .mutation(async ({ input: { leadId, labelId }, ctx }) => {
            const leadNote = await ctx.prisma.leadNote.update({
                where: {
                    id: labelId
                },
                data: {
                    leads: { disconnect: { id: leadId } }
                },
            });

            return {
                leadNote,
            };
        }),
    editLeadNote: protectedProcedure
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
                const updatedLeadNote = await ctx.prisma.leadNote.update({
                    where: {
                        id: id,
                    },
                    data: {
                        value,
                    },
                });

                return { updatedLeadNote };
            }
        ),
    deleteLeadNotes: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            const notes = await ctx.prisma.leadInteraction.findMany({ where: { id: { in: input } }, include: { lead: true } })
            if (!notes.every(note => note?.lead && hasPermission(ctx.session.user, "leads", "update", note.lead))) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const deletedLeadNotes = await ctx.prisma.leadNote.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedLeadNotes };
        }),
});
