import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { leadsCodeGenerator } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { hasPermission } from "@/server/permissions";
import { getCurrentTier } from "@/lib/system";
import { createCourseOrderPayment, createOrderNote, createProductOrderPayment, createQuickOrderUserLead } from "@/server/actions/salesManagement/orders";
import { formatUserForComms, orderConfirmationEmail } from "@/server/actions/emails";

export const ordersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                user: true,
                lead: { include: { assignee: { include: { user: true } } } },
                course: true,
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
                course: true,
            },
        });

        return { orders };
    }),
    getById: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input: { id } }) => {
            const order = await ctx.prisma.order.findUnique({
                where: { id },
                include: {
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } },
                    course: true,
                },
            });
            return { order };
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
                    course: true,
                    product: true,
                    payments: true,
                    refunds: true,
                },
            });
            return { orders };
        }),
    getByOrderNumber: protectedProcedure
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
                    lead: { include: { assignee: { include: { user: true } } } },
                    course: true,
                    product: true,
                },
            });
            return { order };
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
                    course: true,
                    product: true,
                },
            });
            return { order };
        }),
    createProductOrder: protectedProcedure
        .input(
            z.object({
                studentId: z.string(),
                productId: z.string(),
            })
        )
        .mutation(async ({ input: { studentId, productId }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })
            const { amount, orderNumber, paymentIntentId, paymentLink, product, user, lead } = await createProductOrderPayment({ prisma: ctx.prisma, studentId, productId })

            const agent = ctx.session.user
            const agentUserId = agent.id
            const agentUserName = agent.name ?? "Agent Name"

            const [order, note, ...courseStatuses] = await ctx.prisma.$transaction([
                ctx.prisma.order.create({
                    data: {
                        amount,
                        orderNumber,
                        paymentIntentId,
                        paymentLink,
                        product: productId ? { connect: { id: productId } } : undefined,
                        lead: lead?.id ? { connect: { id: lead?.id } } : {
                            create: {
                                code: leadsCodeGenerator(),
                                isAssigned: true,
                                isAutomated: true,
                                isReminderSet: false,
                                source: "Manual",
                                email: user.email,
                                phone: user.phone,
                                name: user.name,
                                user: { connect: { id: user.id } },
                                assignee: { connect: { userId: agentUserId } },
                                leadStage: { connect: { defaultStage: "Converted" } },
                                labels: { connectOrCreate: { where: { value: "Direct order" }, create: { value: "Direct order" } } },
                            }
                        },
                        courseStatuses: {
                            create: product.productItems.map(item => ({
                                status: "OrderCreated",
                                isPrivate: product.isPrivate,
                                course: { connect: { id: item.courseId } },
                                level: item.courseLevelId ? { connect: { id: item.courseLevelId } } : undefined,
                                user: { connect: { id: studentId } },
                            }))
                        },
                        user: { connect: { id: studentId } },
                    },
                }),
                createOrderNote({ prisma: ctx.prisma, agentUserId, agentUserName, isPrivate: product.isPrivate, paymentLink, productName: product.name, studentId, studentName: user.name }),
            ])

            const currentTier = getCurrentTier()
            if (currentTier.onlinePayment) {
                await orderConfirmationEmail({
                    product: { name: product.name, price: product.discountedPrice ?? product.price },
                    student: formatUserForComms(user),
                    prisma: ctx.prisma,
                    order: { orderDate: order.createdAt, orderNumber, paymentLink },
                })
            }

            return {
                order,
                note,
                courseStatuses,
            }
        }),
    createCourseOrder: protectedProcedure
        .input(
            z.object({
                studentId: z.string(),
                courseId: z.string(),
                isPrivate: z.boolean(),
            })
        )
        .mutation(async ({ input: { studentId, courseId, isPrivate }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })
            const { amount, orderNumber, paymentIntentId, paymentLink, course, user, lead } = await createCourseOrderPayment({ prisma: ctx.prisma, studentId, courseId, isPrivate })

            const agent = ctx.session.user
            const agentUserId = agent.id
            const agentUserName = agent.name ?? "Agent Name"

            const [order, note, ...courseStatuses] = await ctx.prisma.$transaction([
                ctx.prisma.order.create({
                    data: {
                        amount,
                        orderNumber,
                        paymentIntentId,
                        paymentLink,
                        course: courseId ? { connect: { id: courseId } } : undefined,
                        lead: lead?.id ? { connect: { id: lead?.id } } : {
                            create: {
                                code: leadsCodeGenerator(),
                                isAssigned: true,
                                isAutomated: true,
                                isReminderSet: false,
                                source: "Manual",
                                email: user.email,
                                phone: user.phone,
                                name: user.name,
                                user: { connect: { id: user.id } },
                                assignee: { connect: { userId: agentUserId } },
                                leadStage: { connect: { defaultStage: "Converted" } },
                                labels: { connectOrCreate: { where: { value: "Direct order" }, create: { value: "Direct order" } } },
                            }
                        },
                        courseStatuses: {
                            create: {
                                status: "OrderCreated",
                                isPrivate,
                                course: { connect: { id: courseId } },
                                user: { connect: { id: studentId } },
                            }
                        },
                        user: { connect: { id: studentId } },
                    },
                }),
                createOrderNote({ prisma: ctx.prisma, agentUserId, agentUserName, isPrivate, paymentLink, productName: course.name, studentId, studentName: user.name }),
            ])

            const currentTier = getCurrentTier()
            if (currentTier.onlinePayment) {
                await orderConfirmationEmail({
                    product: { name: course.name, price: isPrivate ? course.privatePrice : course.groupPrice },
                    student: formatUserForComms(user),
                    prisma: ctx.prisma,
                    order: { orderDate: order.createdAt, orderNumber, paymentLink },
                })
            }

            return {
                order,
                note,
                courseStatuses,
            }
        }),
    createCourseQuickOrder: protectedProcedure
        .input(
            z.object({
                studentName: z.string(),
                studentEmail: z.string().email(),
                studentPhone: z.string(),
                courseId: z.string(),
                isPrivate: z.boolean(),
            })
        )
        .mutation(async ({ input: { studentEmail, studentName, studentPhone, courseId, isPrivate }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })

            const { password, leadId, studentId } = await createQuickOrderUserLead({ agentUserId: ctx.session.user.id, prisma: ctx.prisma, studentEmail, studentName, studentPhone })
            const { amount, orderNumber, paymentIntentId, paymentLink, course, user, } = await createCourseOrderPayment({ prisma: ctx.prisma, studentId, courseId, isPrivate })

            const agent = ctx.session.user
            const agentUserId = agent.id
            const agentUserName = agent.name ?? "Agent Name"

            const [order, note, ...courseStatuses] = await ctx.prisma.$transaction([
                ctx.prisma.order.create({
                    data: {
                        amount,
                        orderNumber,
                        paymentIntentId,
                        paymentLink,
                        course: courseId ? { connect: { id: courseId } } : undefined,
                        lead: { connect: { id: leadId } },
                        user: { connect: { id: studentId } },
                        courseStatuses: {
                            create: {
                                status: "OrderCreated",
                                isPrivate,
                                course: { connect: { id: courseId } },
                                user: { connect: { id: studentId } },
                            }
                        },
                    },
                }),
                createOrderNote({ prisma: ctx.prisma, agentUserId, agentUserName, isPrivate, paymentLink, productName: course.name, studentId, studentName: user.name }),
            ])

            const currentTier = getCurrentTier()
            if (currentTier.onlinePayment) {
                await orderConfirmationEmail({
                    product: { name: course.name, price: isPrivate ? course.privatePrice : course.groupPrice },
                    student: formatUserForComms(user),
                    prisma: ctx.prisma,
                    order: { orderDate: order.createdAt, orderNumber, paymentLink },
                })
            }

            return {
                order,
                note,
                courseStatuses,
                password,
            }
        }),
    createProductQuickOrder: protectedProcedure
        .input(
            z.object({
                studentName: z.string(),
                studentEmail: z.string().email(),
                studentPhone: z.string(),
                productId: z.string(),
            })
        )
        .mutation(async ({ input: { studentEmail, studentName, studentPhone, productId }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })

            const { password, leadId, studentId } = await createQuickOrderUserLead({ agentUserId: ctx.session.user.id, prisma: ctx.prisma, studentEmail, studentName, studentPhone })
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })
            const { amount, orderNumber, paymentIntentId, paymentLink, product, user } = await createProductOrderPayment({ prisma: ctx.prisma, studentId, productId })

            const agent = ctx.session.user
            const agentUserId = agent.id
            const agentUserName = agent.name ?? "Agent Name"

            const [order, note, ...courseStatuses] = await ctx.prisma.$transaction([
                ctx.prisma.order.create({
                    data: {
                        amount,
                        orderNumber,
                        paymentIntentId,
                        paymentLink,
                        product: productId ? { connect: { id: productId } } : undefined,
                        lead: { connect: { id: leadId } },
                        user: { connect: { id: studentId } },
                        courseStatuses: {
                            create: product.productItems.map(item => ({
                                status: "OrderCreated",
                                isPrivate: product.isPrivate,
                                course: { connect: { id: item.courseId } },
                                level: item.courseLevelId ? { connect: { id: item.courseLevelId } } : undefined,
                                user: { connect: { id: studentId } },
                            }))
                        },
                    },
                }),
                createOrderNote({ prisma: ctx.prisma, agentUserId, agentUserName, isPrivate: product.isPrivate, paymentLink, productName: product.name, studentId, studentName: user.name }),
            ])

            const currentTier = getCurrentTier()
            if (currentTier.onlinePayment) {
                await orderConfirmationEmail({
                    product: { name: product.name, price: product.discountedPrice ?? product.price },
                    student: formatUserForComms(user),
                    prisma: ctx.prisma,
                    order: { orderDate: order.createdAt, orderNumber, paymentLink },
                })
            }

            return {
                order,
                note,
                courseStatuses,
                password,
            }
        }),
    editOrder: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                courseDetails: z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                }),
            })
        )
        .mutation(async ({ ctx, input: { id, courseDetails } }) => {
            if (!hasPermission(ctx.session.user, "orders", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update payments, Please contact your Admin!" })
            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseDetails.courseId
                }
            })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "No course found!" })
            const totalPrice = courseDetails.isPrivate ? course.privatePrice : course.groupPrice

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id,
                },
                data: {
                    amount: totalPrice,
                    course: { connect: { id: courseDetails.courseId } },
                },
                include: {
                    course: true,
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } }
                },
            });

            return { updatedOrder };
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
            const cancelledOrder = await ctx.prisma.order.update({
                where: { id: orderId },
                data: { status: "Cancelled" },
                include: {
                    course: true,
                    product: { include: { productItems: true } },
                }
            })

            const [courseStatuses] = await ctx.prisma.$transaction(cancelledOrder.product ? cancelledOrder.product.productItems.map(({ courseId, courseLevelId }) =>
                ctx.prisma.courseStatus.updateMany({
                    where: {
                        AND: [
                            { userId: cancelledOrder.userId },
                            { courseId },
                            { courseLevelId },
                        ],
                    },
                    data: {
                        status: "Cancelled",
                    },
                })
            ) : cancelledOrder.course ? [
                ctx.prisma.courseStatus.updateMany({
                    where: {
                        AND: [
                            { userId: cancelledOrder.userId },
                            { courseId: cancelledOrder.course.id },
                            { status: "OrderCreated" },
                        ],
                    },
                    data: {
                        status: "Cancelled",
                    },
                })
            ] : [])

            return { cancelledOrder, courseStatuses }
        })
});
