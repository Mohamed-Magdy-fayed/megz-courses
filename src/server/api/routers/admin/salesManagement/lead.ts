import { leadsCodeGenerator, orderCodeGenerator } from "@/lib/utils";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";
import { createPaymentIntent } from "@/lib/paymobHelpers";
import { env } from "@/env.mjs";
import { EmailsWrapper } from "@/components/emails/EmailsWrapper";
import { CredentialsEmail } from "@/components/emails/CredintialsEmail";
import { sendZohoEmail } from "@/lib/emailHelpers";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
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
        .query(async ({ ctx }) => {
            const leads = await ctx.prisma.lead.findMany({
                include: {
                    leadStage: true, assignee: { include: { user: true } },
                    labels: true,
                    notes: true,
                }
            });

            return { leads };
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
                    orderDetails: {
                        include: {
                            course: { include: { systemForms: true } },
                            user: {
                                include: {
                                    placementTests: {
                                        where: {
                                            course: { orders: { some: { lead: { code } } } }
                                        },
                                        include: { zoomSessions: { include: { zoomClient: true } } },
                                    }
                                }
                            },
                        }
                    },
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
    convertLead: protectedProcedure
        .input(z.object({
            leadId: z.string(),
            name: z.string(),
            phone: z.string(),
            email: z.string().email(),
            courseId: z.string(),
            isPrivate: z.boolean(),
        }))
        .mutation(async ({ ctx, input: { leadId, email, name, phone, courseId, isPrivate } }) => {
            if (!hasPermission(ctx.session.user, "leads", "update")) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You are not authorized to create orders, Please contact your Admin!"
            })

            const salesAgentUser = await ctx.prisma.user.findUnique({ where: { id: ctx.session.user.id }, include: { SalesAgent: true } })
            if (!salesAgentUser) throw new TRPCError({ code: "BAD_REQUEST", message: "No salesagent user found!" })

            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

            const password = "@P" + randomUUID().toString().split("-")[0] as string;
            const hashedPassword = await bcrypt.hash(password, 10)
            const user = await ctx.prisma.user.findUnique({ where: { name, email, phone, hashedPassword, emailVerified: new Date() } })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to create user" })

            const totalPrice = isPrivate ? course.privatePrice : course.groupPrice
            const orderNumber = orderCodeGenerator()

            const intentResponse = await createPaymentIntent(totalPrice, course, user, orderNumber)
            if (!intentResponse.client_secret) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "intent failed" })

            const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

            const convertedStage = await ctx.prisma.leadStage.findUnique({ where: { defaultStage: "Converted" } })
            if (!convertedStage) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Default Stage Missing!" })

            const [order] = await ctx.prisma.$transaction([
                ctx.prisma.order.create({
                    data: {
                        amount: totalPrice,
                        orderNumber,
                        paymentId: intentResponse.id,
                        paymentLink,
                        lead: { connect: { id: leadId } },
                        course: { connect: { id: courseId } },
                        user: { connect: { id: user.id } },
                        courseType: { id: courseId, isPrivate }
                    },
                    include: {
                        course: true,
                        user: true,
                        lead: { include: { assignee: { include: { user: true } } } }
                    },
                }),
                ctx.prisma.lead.update({
                    where: { id: leadId },
                    data: {
                        leadStageId: convertedStage.id
                    }
                }),
                ctx.prisma.courseStatus.create({
                    data: {
                        status: "OrderCreated",
                        course: { connect: { id: courseId } },
                        user: { connect: { id: user.id } },
                    }
                }),
                ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Quick Order Placed by ${salesAgentUser.name}`,
                        type: "Info",
                        createdForStudent: { connect: { id: user.id } },
                        messages: [{
                            message: `An order was placed by ${salesAgentUser.name} for Student ${user.name} regarding course ${course.name} for a ${isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: salesAgentUser.id } },
                    }
                })
            ])

            const courseLink = `${env.NEXT_PUBLIC_NEXTAUTH_URL}my_courses`
            const html = await EmailsWrapper({
                EmailComp: CredentialsEmail,
                prisma: ctx.prisma,
                props: {
                    courseLink,
                    customerName: name,
                    password,
                    userEmail: email,
                }
            })

            await sendZohoEmail({ email, html, subject: `Your credentials for accessing the course materials` })
            await sendWhatsAppMessage({
                prisma: ctx.prisma, toNumber: phone, type: "CredentialsEmail", variables: {
                    name,
                    email,
                    password,
                    coursesLink: courseLink
                }
            })

            return {
                order,
                password,
                user,
                paymentLink,
            };
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
