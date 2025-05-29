import { z } from "zod";
import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { leadsCodeGenerator, orderCodeGenerator } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { getCurrentTier } from "@/lib/system";
import { createOrderPayment, createQuickOrderUserLead } from "@/server/actions/salesManagement/orders";
import { orderConfirmationEmail, orderNotificationEmail } from "@/server/actions/emails";
import { formatUserForComms } from "@/lib/fcmhelpers"
import { appRouter } from "@/server/api/root";
import { createOrderInput } from "@/pages/admin/sales_management/orders";
import { ROOT_EMAIL } from "@/server/constants";

export const ordersRouter = createTRPCRouter({
    getSalesTotal: protectedProcedure
        .input(z.object({ from: z.date(), to: z.date() }).optional())
        .query(async ({ ctx, input }) => {
            const nowFrom = input?.from ?? new Date(0);
            const nowTo = input?.to ?? new Date();

            const lastWeekFrom = new Date(nowFrom);
            lastWeekFrom.setDate(lastWeekFrom.getDate() - 7);
            const lastWeekTo = new Date(nowTo);
            lastWeekTo.setDate(lastWeekTo.getDate() - 7);

            const [current, lastWeek] = await ctx.prisma.$transaction([
                ctx.prisma.order.aggregate({
                    _sum: { amount: true },
                    _count: { id: true },
                    where: {
                        createdAt: { gte: nowFrom, lt: nowTo },
                        status: { not: 'Cancelled' },
                    },
                }),
                ctx.prisma.order.aggregate({
                    _sum: { amount: true },
                    where: {
                        createdAt: { gte: lastWeekFrom, lt: lastWeekTo },
                        status: { not: 'Cancelled' },
                    },
                }),
            ]);

            const currentTotal = current._sum.amount ?? 0;
            const lastWeekTotal = lastWeek._sum.amount ?? 0;
            const change = currentTotal - lastWeekTotal;

            return { totalIncome: currentTotal, change, totalOrders: current._count.id };
        }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                user: true,
                lead: { include: { assignee: { include: { user: true } } } },
                product: true,
                payments: true,
                refunds: true,
            },
            orderBy: {
                id: "desc"
            },
        });

        return { orders };
    }),
    getLatest: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
            include: {
                user: true,
                lead: { include: { assignee: { include: { user: true } } } },
            },
        });

        return { orders };
    }),
    getByUserId: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .query(async ({ ctx, input: { userId } }) => {
            const orders = await ctx.prisma.order.findMany({
                where: { userId },
                include: {
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } },
                    product: true,
                    payments: true,
                    refunds: true,
                },
            });
            return { orders };
        }),
    getByOrderNumberPublic: publicProcedure
        .input(
            z.object({
                orderNumber: z.string(),
            })
        )
        .query(async ({ ctx, input: { orderNumber } }) => {
            const order = await ctx.prisma.order.findFirst({
                where: { orderNumber },
                include: {
                    user: true,
                    product: true,
                },
            });
            return { order };
        }),
    createOrder: protectedProcedure
        .input(createOrderInput)
        .mutation(async ({ input: { studentId, productId, isPrivate, studentData }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })
            if (!studentId && !studentData) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Either studentId or studentData must be provided." })
            }

            const product = await ctx.prisma.product.findUnique({ where: { id: productId }, include: { productItems: true } })
            if (!product) throw new TRPCError({ code: "BAD_REQUEST", message: "No product found!" })

            const orderNumber = orderCodeGenerator()
            const agentUserId = ctx.session.user.id

            let leadId = ""
            let createdStudentId = ""
            let password = ""

            if (studentId) {
                const student = await ctx.prisma.user.findUnique({ where: { id: studentId }, include: { leads: true } })
                if (!student) throw new TRPCError({ code: "BAD_REQUEST", message: "No student found!" })

                if (student.leads[0]?.id) {
                    leadId = student.leads[0]?.id
                } else {
                    const lead = await ctx.prisma.lead.create({
                        data: {
                            code: leadsCodeGenerator(),
                            isAssigned: true,
                            isAutomated: true,
                            isReminderSet: false,
                            source: "Manual",
                            email: student.email,
                            phone: student.phone,
                            name: student.name,
                            user: { connect: { id: student.id } },
                            assignee: { connect: { userId: agentUserId } },
                            leadStage: { connect: { defaultStage: "Converted" } },
                            labels: { connectOrCreate: { where: { value: "Direct order" }, create: { value: "Direct order" } } },
                        }
                    })

                    leadId = lead.id
                }
            } else if (studentData) {
                const { studentEmail, studentName, studentPhone } = studentData
                const data = await createQuickOrderUserLead({ agentUserId: ctx.session.user.id, prisma: ctx.prisma, studentEmail, studentName, studentPhone })

                createdStudentId = data.studentId
                leadId = data.leadId
                password = data.password
            }

            const order = await ctx.prisma.order.create({
                data: {
                    amount: isPrivate ? product.privatePrice : product.groupPrice,
                    orderNumber,
                    paymentIntentId: "",
                    paymentLink: "",
                    product: { connect: { id: productId } },
                    user: { connect: { id: studentId || createdStudentId } },
                    lead: { connect: { id: leadId } },
                    courseStatuses: {
                        create: product.productItems.map(item => ({
                            status: "OrderCreated",
                            isPrivate,
                            course: { connect: { id: item.courseId } },
                            level: item.courseLevelId ? { connect: { id: item.courseLevelId } } : undefined,
                            user: { connect: { id: studentId || createdStudentId } },
                        }))
                    },
                }
            })

            const caller = createCallerFactory(appRouter);
            caller(ctx).orders.createOrderSideEffects({ orderId: order.id })

            return {
                order,
                password,
            }
        }),
    createOrderSideEffects: protectedProcedure
        .input(
            z.object({
                orderId: z.string(),
            })
        )
        .mutation(async ({ ctx, input: { orderId } }) => {
            const order = await ctx.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    product: true,
                    user: true,
                    courseStatuses: { select: { isPrivate: true } },
                    lead: { select: { assignee: { select: { user: { select: { id: true, name: true } } } } } },
                }
            })
            if (!order) throw new TRPCError({ code: "BAD_REQUEST", message: "No order found!" })

            const isPrivate = order.courseStatuses.some(s => s.isPrivate)

            const { paymentIntentId, paymentLink } = await createOrderPayment({
                prisma: ctx.prisma,
                isPrivate,
                studentId: order.user.id,
                productId: order.product.id,
                orderNumber: order.orderNumber,
            })

            const agent = order.lead.assignee?.user;
            if (!agent) throw new TRPCError({ code: "BAD_REQUEST", message: "No agent found!" })
            const agentUserId = agent.id;
            const agentUserName = agent.name;
            const productName = order.product.name

            const [updatedOrder, note] = await ctx.prisma.$transaction([
                ctx.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentIntentId,
                        paymentLink,
                    },
                }),
                ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `An Order Placed by ${agentUserName}`,
                        type: "Info",
                        createdForStudent: { connect: { id: order.user.id } },
                        messages: [
                            {
                                message: `An order was placed by ${agentUserName} for Student ${order.user.name} regarding product ${productName} for a ${isPrivate ? "private" : "group"} purchase. The order is now awaiting payment.\nPayment Link: ${paymentLink}`,
                                updatedAt: new Date(),
                                updatedBy: "System",
                            },
                        ],
                        createdByUser: { connect: { id: agentUserId } },
                    },
                })
            ]);

            const currentTier = getCurrentTier();
            if (currentTier.onlinePayment) {
                await orderConfirmationEmail({
                    product: {
                        name: productName,
                        price: order.amount,
                    },
                    student: formatUserForComms(order.user),
                    prisma: ctx.prisma,
                    order: {
                        orderDate: new Date(),
                        orderNumber: order.orderNumber,
                        paymentLink,
                    },
                });
            }

            const admin = await ctx.prisma.user.findFirst({ where: { userRoles: { has: "Admin" }, email: { not: ROOT_EMAIL } } })
            if (admin) {
                await orderNotificationEmail({
                    product: {
                        name: productName,
                        price: order.amount,
                    },
                    studentEmail: order.user.email,
                    prisma: ctx.prisma,
                    order: {
                        orderDate: new Date(),
                        orderNumber: order.orderNumber,
                        paymentLink,
                    },
                    adminEmail: admin.email,
                    adminFMCTokens: admin.fcmTokens,
                    adminName: admin.name,
                })
            }

            return { updatedOrder, note };
        }),
    deleteOrders: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "delete")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const deletedOrders = await ctx.prisma.order.deleteMany({
                where: {
                    id: {
                        in: input,
                    },
                },
            });

            return { deletedOrders };
        }),
    cancel: protectedProcedure
        .input(z.object({ orderId: z.string() }))
        .mutation(async ({ ctx, input: { orderId } }) => {
            if (!hasPermission(ctx.session.user, "orders", "cancel")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your Admin!" })
            const cancelledOrder = await ctx.prisma.order.update({
                where: { id: orderId },
                data: { status: "Cancelled" },
                include: {
                    courseStatuses: true,
                }
            })

            const [courseStatuses] = await ctx.prisma.$transaction(cancelledOrder.courseStatuses.map(({ id }) =>
                ctx.prisma.courseStatus.update({
                    where: { id },
                    data: {
                        status: "Cancelled",
                    },
                })
            ))

            return { cancelledOrder, courseStatuses }
        })
});
