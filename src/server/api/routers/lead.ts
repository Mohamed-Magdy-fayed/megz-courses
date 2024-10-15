import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import { z } from "zod";

export const leadsRouter = createTRPCRouter({
    createLead: protectedProcedure
        .input(z.object({
            name: z.string(),
            email: z.string().email(),
            phone: z.string(),
        }))
        .mutation(async ({ ctx, input: { email, name, phone } }) => {
            const intakeStage = await ctx.prisma.leadStage.findFirst({
                where: { defaultStage: "Intake" }
            })
            if (!intakeStage) throw new TRPCError({ code: "BAD_REQUEST", message: "no default stage found!" })

            const lead = await ctx.prisma.lead.create({
                data: {
                    email,
                    name,
                    phone,
                    isAssigned: false,
                    isAutomated: false,
                    isReminderSet: false,
                    source: "Manual",
                    leadStage: {
                        connect: { id: intakeStage.id }
                    },
                }
            })

            return { lead }
        }),
    import: protectedProcedure
        .input(z.array(z.object({
            name: z.string(),
            email: z.string().email(),
            phone: z.string(),
        })))
        .mutation(async ({ ctx, input }) => {
            const intakeStage = await ctx.prisma.leadStage.findFirst({
                where: { defaultStage: "Intake" }
            })
            if (!intakeStage) throw new TRPCError({ code: "BAD_REQUEST", message: "no default stage found!" })

            const leads = await ctx.prisma.lead.createMany({
                data: input.map(item => ({
                    ...item,
                    isAssigned: false,
                    isAutomated: false,
                    isReminderSet: false,
                    source: "Manual",
                    leadStageId: intakeStage.id,
                })),
            })

            return { count: leads.count }
        }),
    getLeads: protectedProcedure
        .query(async ({ ctx }) => {
            const leads = await ctx.prisma.lead.findMany({ include: { leadStage: true } });

            return { leads };
        }),
    assignLead: protectedProcedure
        .input(z.object({
            agentId: z.string(),
            leadId: z.string(),
        }))
        .mutation(async ({ ctx, input: { agentId, leadId } }) => {
            const lead = await ctx.prisma.lead.update({
                where: { id: leadId },
                data: {
                    assignee: { connect: { userId: agentId } },
                    isAssigned: true,
                },
                include: { assignee: { include: { user: true } } },
            });

            return { lead };
        }),
    assignAll: protectedProcedure
        .input(z.object({
            stageId: z.string(),
        }))
        .mutation(async ({ ctx, input: { stageId } }) => {
            try {
                const agents = await ctx.prisma.salesAgent.findMany({
                    where: { user: { userType: "salesAgent" } },
                    include: { leads: { include: { leadStage: true } } },
                })

                const agentsWithLeadsCount = agents.map(agent => ({
                    agentId: agent.id,
                    leadsCount: agent.leads.length
                })).sort((a, b) => a.leadsCount - b.leadsCount)

                const leads = await ctx.prisma.lead.findMany({
                    where: {
                        AND: {
                            leadStageId: stageId,
                            isAssigned: false,
                            assignee: null,
                        },
                    },
                    include: { assignee: { include: { user: true } } },
                });

                let leadAssignments: { agentId: string; leadId: string }[] = [];
                leads.forEach((lead, index) => {
                    const agentIndex = index % agentsWithLeadsCount.length;
                    leadAssignments.push({
                        agentId: agentsWithLeadsCount[agentIndex]?.agentId!,
                        leadId: lead.id,
                    });
                });

                const updatePromises = leadAssignments.map(({ agentId, leadId }) =>
                    ctx.prisma.lead.update({
                        where: { id: leadId },
                        data: { assignee: { connect: { id: agentId } } },
                    })
                );

                const updatedLeads = await Promise.all(updatePromises);

                return { updatedLeads };
            } catch (error) {
                throw new TRPCError(getTRPCErrorFromUnknown(error))
            }
        }),
    moveLead: protectedProcedure
        .input(z.object({
            leadId: z.string(),
            toStageId: z.string(),
        }))
        .mutation(async ({ ctx, input: { leadId, toStageId } }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action!" })
            const lead = await ctx.prisma.lead.findUnique({
                where: { id: leadId },
                include: { assignee: { include: { user: true } } }
            })

            if (!lead?.assignee?.user.id && ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found!" })
            if (ctx.session.user.id !== lead?.assignee?.user.id && ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action!" })

            const updatedLead = await ctx.prisma.lead.update({
                where: { id: leadId },
                data: { leadStage: { connect: { id: toStageId } } },
                include: { leadStage: true }
            })

            return {
                updatedLead
            }
        }),
    deleteLead: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
            const deletedLeads = await ctx.prisma.lead.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedLeads };
        }),
});
