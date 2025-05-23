import { leadsCodeGenerator } from "@/lib/utils";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import { z } from "zod";
import { hasPermission } from "@/server/permissions";

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
                    code: leadsCodeGenerator(),
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
                    code: leadsCodeGenerator(),
                    status: "Created",
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
        .input(z.object({
            name: z.string(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const leads = await ctx.prisma.lead.findMany({
                where: {
                    leadStage: input?.name ? { name: input.name } : undefined,
                },
                include: {
                    leadStage: true, assignee: { include: { user: true } },
                    labels: true,
                    notes: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return leads;
        }),
    getConversionRate: protectedProcedure
        .input(z.object({
            from: z.date(),
            to: z.date(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const weekDuration = 1000 * 60 * 60 * 24 * 7;

            const convertedStageId = await ctx.prisma.leadStage.findFirst({
                where: { defaultStage: 'Converted' },
                select: { id: true },
            }).then(res => res?.id);
            if (!convertedStageId) return { conversionRate: 0, change: 0 };

            const [totalCurrent, convertedCurrent, totalPrev, convertedPrev] = await ctx.prisma.$transaction([
                ctx.prisma.lead.count({ where: input ? { updatedAt: { gte: input.from, lt: input.to } } : {} }),
                ctx.prisma.lead.count({ where: input ? { updatedAt: { gte: input.from, lt: input.to }, leadStageId: convertedStageId } : { leadStageId: convertedStageId } }),
                ctx.prisma.lead.count({ where: { updatedAt: { lt: new Date(Date.now() - weekDuration) } } }),
                ctx.prisma.lead.count({ where: { updatedAt: { lt: new Date(Date.now() - weekDuration) }, leadStageId: convertedStageId } }),
            ]);

            const currentRate = totalCurrent ? convertedCurrent / totalCurrent : 0;
            const previousRate = totalPrev ? convertedPrev / totalPrev : 0;
            const change = currentRate - previousRate;

            return { conversionRate: currentRate, change, previousRate, asd: {totalCurrent, convertedCurrent, totalPrev, convertedPrev} };
        }),
    getLeadOrders: protectedProcedure
        .input(z.object({
            leadId: z.string(),
        }))
        .query(async ({ ctx, input: { leadId } }) => {
            const orders = await ctx.prisma.order.findMany({
                where: { leadId },
                include: {
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } },
                    product: true,
                    payments: true,
                    refunds: true,
                }
            });

            return { orders };
        }),
    queryLeads: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(10),
            cursor: z.string().nullish(),
        }))
        .query(async ({ ctx, input: { limit, cursor } }) => {
            const items = await ctx.prisma.lead.findMany({
                include: {
                    leadStage: true, assignee: { include: { user: true } },
                    labels: true,
                    notes: true,
                    user: true,
                },
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { id: "desc" },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            const totalCount = await ctx.prisma.courseStatus.count();

            return { rows: items, totalCount, nextCursor };
        }),
    getMyLeads: protectedProcedure
        .query(async ({ ctx }) => {
            const assigneeId = ctx.session.user.id
            const leads = await ctx.prisma.lead.findMany({
                where: { assigneeId },
                include: {
                    labels: true,
                    assignee: { include: { user: true } },
                    notes: true,
                    leadStage: true,
                }
            });

            return { leads };
        }),
    getById: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ ctx, input: { id } }) => {
            const lead = await ctx.prisma.lead.findUnique({
                where: { id },
                include: {
                    leadStage: true,
                    assignee: { include: { user: true } },
                    labels: true,
                    notes: true,
                }
            });

            return { lead };
        }),
    getByCode: protectedProcedure
        .input(z.object({
            code: z.string(),
        }))
        .query(async ({ ctx, input: { code } }) => {
            const lead = await ctx.prisma.lead.findFirst({
                where: { code },
                include: {
                    leadStage: true,
                    assignee: { include: { user: true } },
                    labels: true,
                    notes: true,
                    interactions: { include: { customer: true, salesAgent: { include: { user: true } } } },
                    orders: true,
                }
            });

            return { lead };
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
            stageId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input: { stageId } }) => {
            try {
                const agents = await ctx.prisma.salesAgent.findMany({
                    where: { user: { userRoles: { has: "SalesAgent" } } },
                    include: { leads: { include: { leadStage: true } } },
                })

                const agentsWithLeadsCount = agents.map(agent => ({
                    agentId: agent.id,
                    leadsCount: agent.leads.length
                })).sort((a, b) => a.leadsCount - b.leadsCount)

                const leads = !stageId
                    ? await ctx.prisma.lead.findMany({
                        where: {
                            AND: {
                                isAssigned: false,
                                assignee: null,
                            },
                        },
                        include: { assignee: { include: { user: true } } },
                    })
                    : await ctx.prisma.lead.findMany({
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
    moveLeads: protectedProcedure
        .input(z.object({
            leadIds: z.array(z.string()),
            toStageId: z.string(),
        }))
        .mutation(async ({ ctx, input: { leadIds, toStageId } }) => {
            const leadsToMove = await ctx.prisma.lead.findMany({ where: { id: { in: leadIds } }, include: { leadStage: true, assignee: { include: { user: true } } } })

            if (!hasPermission(ctx.session.user, "leads", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action!" })

            const toStage = await ctx.prisma.leadStage.findUnique({ where: { id: toStageId } })
            const isConverted = toStage?.defaultStage === "Converted"

            if (isConverted) {
                const [updatedLeads] = await ctx.prisma.$transaction([
                    ctx.prisma.lead.updateMany({
                        where: { id: { in: leadIds } },
                        data: { leadStageId: toStageId },
                    }),
                ])

                return {
                    updatedLeads,
                }
            } else {
                if (leadsToMove.some(lead => lead.leadStage?.defaultStage === "Converted")) {
                    const [updatedLeads, ...createdNotes] = await ctx.prisma.$transaction([
                        ctx.prisma.lead.updateMany({
                            where: { id: { in: leadIds } },
                            data: { leadStageId: toStageId },
                        }),
                        ...leadIds.map(id =>
                            ctx.prisma.leadNote.create({
                                data: {
                                    leads: { connect: { id } },
                                    value: `Lead moved from Converted to ${toStage?.name}`
                                }
                            })
                        )
                    ])

                    return {
                        createdNotes,
                        updatedLeads,
                    }
                }
                const updatedLeads = await ctx.prisma.lead.updateMany({
                    where: { id: { in: leadIds } },
                    data: { leadStageId: toStageId },
                })
                return {
                    updatedLeads
                }
            }
        }),
    editLead: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
        }))
        .mutation(async ({ input: { email, id, name, phone }, ctx }) => {
            const lead = await ctx.prisma.lead.findUnique({ where: { id } })
            if (!lead) throw new TRPCError({ code: "BAD_REQUEST", message: "No lead with this ID!" })
            if (!hasPermission(ctx.session.user, "leads", "update", lead)) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const updatedLead = await ctx.prisma.lead.update({
                where: { id },
                data: {
                    name,
                    email,
                    phone,
                }
            })

            return { updatedLead };
        }),
    addReminder: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string(),
            time: z.date(),
        }))
        .mutation(async ({ input: { id, title, time }, ctx }) => {
            const lead = await ctx.prisma.lead.findUnique({ where: { id } })
            if (!lead) throw new TRPCError({ code: "BAD_REQUEST", message: "No lead with this ID!" })
            if (!hasPermission(ctx.session.user, "leads", "update", lead)) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const updatedLead = await ctx.prisma.lead.update({
                where: { id },
                data: {
                    isReminderSet: true,
                    reminders: { push: { title, time } },
                }
            })

            return { updatedLead };
        }),
    cancelReminder: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ input: { id }, ctx }) => {
            const lead = await ctx.prisma.lead.findUnique({ where: { id } })
            if (!lead) throw new TRPCError({ code: "BAD_REQUEST", message: "No lead with this ID!" })
            if (!hasPermission(ctx.session.user, "leads", "update", lead)) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

            const updatedLead = await ctx.prisma.lead.update({
                where: { id },
                data: {
                    isReminderSet: false,
                }
            })

            return { updatedLead };
        }),
    deleteLead: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "leads", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })

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
