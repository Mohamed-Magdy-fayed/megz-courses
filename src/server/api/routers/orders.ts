import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { formatPrice, hasAccess, leadsCodeGenerator, orderCodeGenerator } from "@/lib/utils";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Course, Order, User } from "@prisma/client";
import { randomUUID } from "crypto";
import { env } from "@/env.mjs";
import axios from "axios";
import { createPaymentIntent, formatAmountForPaymob } from "@/lib/paymobHelpers";
import { format } from "date-fns";
import { sendZohoEmail } from "@/lib/emailHelpers";
import Email from "@/components/emails/Email";
import { EmailsWrapper } from "@/components/emails/EmailsWrapper";
import PaymentConfEmail from "@/components/emails/PaymentConfEmail";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { hasPermission } from "@/server/permissions";
import { createUser, getUserById } from "@/server/api/services/users";
import { getCourseById } from "@/server/api/services/courses";
import { getLeadStage } from "@/server/api/services/leadStages";
import { createLead } from "@/server/api/services/leads";
import { subscriptionTiers } from "@/lib/system";

export const ordersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                user: true,
                lead: { include: { assignee: { include: { user: true } } } },
                course: true,
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
                },
            });
            return { order };
        }),
    createOrder: protectedProcedure
        .input(
            z.object({
                courseDetails: z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                }),
                leadId: z.string(),
                email: z.string().email(),
            })
        )
        .mutation(async ({ input: { courseDetails, leadId, email }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })
            const user = await ctx.prisma.user.findUnique({
                where: {
                    email
                },
                include: { courseStatus: true }
            })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "No user with this Email" })

            const foundMatchingCourse = user?.courseStatus.some((status) => status.courseId === courseDetails.courseId && (
                status.status === "OrderCreated" ||
                status.status === "OrderPaid" ||
                status.status === "Waiting" ||
                status.status === "Ongoing"
            ));

            if (foundMatchingCourse) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'One or more courses are already in progress or Completed by the user.',
                });
            }

            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseDetails.courseId
                }
            })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "No course found" })
            const coursePrice = courseDetails.isPrivate ? course.privatePrice : course.groupPrice

            const orderNumber = orderCodeGenerator()

            const intentResponse = await createPaymentIntent(coursePrice, course, user, orderNumber)
            const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

            const order = await ctx.prisma.order.create({
                data: {
                    amount: coursePrice,
                    orderNumber,
                    paymentId: intentResponse.id,
                    paymentLink,
                    course: { connect: { id: courseDetails.courseId } },
                    lead: { connect: { id: leadId } },
                    user: { connect: { email } },
                    courseType: { id: courseDetails.courseId, isPrivate: courseDetails.isPrivate }
                },
                include: {
                    course: true,
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "OrderCreated",
                    course: { connect: { id: courseDetails.courseId } },
                    user: { connect: { id: user.id } },
                }
            })

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `An Order Placed by ${ctx.session.user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: user.id } },
                    messages: [{
                        message: `An order was placed by ${ctx.session.user.name} for Student ${user.name} regarding course ${course?.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: ctx.session.user.id } },
                }
            })

            const html = await EmailsWrapper({
                EmailComp: Email,
                prisma: ctx.prisma,
                props: {
                    course: { courseName: course.name, coursePrice: formatPrice(coursePrice) },
                    customerName: user.name,
                    userEmail: user.email,
                    orderNumber: order.orderNumber,
                    orderAmount: formatPrice(coursePrice),
                    orderCreatedAt: format(order.createdAt, "PPPp"),
                    paymentLink,
                }
            })

            const tier = env.TIER
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({
                html,
                subject: `Thanks for your order ${orderNumber}`,
                email: user.email
            })
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendWhatsAppMessage({
                prisma: ctx.prisma,
                toNumber: user.phone,
                type: "OrderPlaced",
                variables: {
                    name: user.name,
                    orderNumber: order.orderNumber,
                    orderTotal: formatPrice(order.amount),
                    paymentLink
                }
            })

            return { orderNumber }
        }),
    createOrderWithLead: protectedProcedure
        .input(
            z.object({
                courseDetails: z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                }),
                email: z.string().email(),
            })
        )
        .mutation(async ({ input: { courseDetails, email }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your Admin!" })

            const user = await ctx.prisma.user.findUnique({
                where: {
                    email
                },
                include: { courseStatus: true }
            })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "No user with this Email" })

            const foundMatchingCourse = user?.courseStatus.some((status) => status.courseId === courseDetails.courseId);
            if (foundMatchingCourse) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'One or more courses are already in progress or Completed by the user.',
                });
            }

            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseDetails.courseId
                }
            })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "No course found" })
            const totalPrice = courseDetails.isPrivate ? course.privatePrice : course.groupPrice

            const orderNumber = orderCodeGenerator()

            const intentResponse = await createPaymentIntent(totalPrice, course, user, orderNumber)
            const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

            const order = await ctx.prisma.order.create({
                data: {
                    amount: totalPrice,
                    orderNumber,
                    paymentId: intentResponse.id,
                    paymentLink,
                    course: { connect: { id: courseDetails.courseId } },
                    lead: {
                        create: {
                            code: leadsCodeGenerator(),
                            isAssigned: true,
                            isAutomated: false,
                            isReminderSet: false,
                            source: "Manual",
                            assignee: { connect: { userId: ctx.session.user.id } },
                            image: user.image,
                            name: user.name,
                            phone: user.phone,
                            email: user.email,
                            leadStage: { connect: { name: "Converted" } },
                        }
                    },
                    user: { connect: { email } },
                    courseType: { id: courseDetails.courseId, isPrivate: courseDetails.isPrivate },
                    status: "Pending",
                },
                include: {
                    course: true,
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "OrderCreated",
                    course: { connect: { id: courseDetails.courseId } },
                    user: { connect: { id: user.id } },
                }
            })

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `An Order Placed by ${order.lead.assignee?.user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: user.id } },
                    messages: [{
                        message: `An order was placed by ${order.lead.assignee?.user.name} for Student ${user.name} regarding course ${course?.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: order.lead.assignee?.user.id } },
                }
            })

            const html = await EmailsWrapper({
                prisma: ctx.prisma,
                EmailComp: Email,
                props: {
                    orderCreatedAt: format(order.createdAt, "dd MMM yyyy"),
                    userEmail: user.email,
                    orderAmount: formatPrice(order.amount),
                    orderNumber: orderNumber,
                    paymentLink: paymentLink,
                    customerName: user.name,
                    course: {
                        courseName: course.name,
                        coursePrice: order.courseType.isPrivate
                            ? formatPrice(course.privatePrice)
                            : formatPrice(course.groupPrice)
                    },
                },
            })

            const tier = env.TIER
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({
                html,
                email: user.email,
                subject: `Thanks for your order ${orderNumber}`
            })
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendWhatsAppMessage({
                prisma: ctx.prisma,
                toNumber: user.phone,
                type: "OrderPlaced",
                variables: {
                    name: user.name,
                    orderNumber,
                    orderTotal: formatPrice(totalPrice),
                    paymentLink
                }
            })

            return {
                orderNumber,
            }
        }),
    quickOrder: protectedProcedure
        .input(
            z.object({
                courseDetails: z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                }),
                email: z.string().email(),
                name: z.string(),
                phone: z.string(),
            })
        )
        .mutation(async ({ input: { courseDetails, email, name, phone }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "create")) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You are not authorized to create orders, Please contact your Admin!"
            })

            const password = "@P" + randomUUID().toString().split("-")[0] as string;
            const user = await createUser(ctx.prisma, { name, email, phone, password, emailVerified: true })
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to get user" })

            const salesAgentUser = await getUserById(ctx.prisma, ctx.session.user.id, { SalesAgent: true })
            if (!salesAgentUser) throw new TRPCError({ code: "BAD_REQUEST", message: "No user found!" })
            const salesAgentId = salesAgentUser.id

            const course = await getCourseById(ctx.prisma, courseDetails.courseId)
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

            const totalPrice = courseDetails.isPrivate ? course.privatePrice : course.groupPrice
            const orderNumber = orderCodeGenerator()

            const intentResponse = await createPaymentIntent(totalPrice, course, user, orderNumber)
            if (!intentResponse.client_secret) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "intent failed" })

            const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

            const convertedStageId = (await getLeadStage(ctx.prisma, { defaultStage: "Converted" }))?.id
            if (!convertedStageId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No converted stage found!" })

            const lead = await createLead(ctx.prisma, {
                assignee: { connect: { userId: salesAgentId } },
                code: leadsCodeGenerator(),
                isAssigned: true,
                isAutomated: false,
                isReminderSet: false,
                source: "Manual",
                email: user.email,
                name: user.name,
                phone: user.phone,
                leadStage: { connect: { id: convertedStageId } },
                labels: { connectOrCreate: { where: { value: "Quick Order" }, create: { value: "Quick Order" } } },
                message: "Quick Order",
            })
            if (!lead) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "create lead failed" })

            const order = await ctx.prisma.order.create({
                data: {
                    amount: totalPrice,
                    orderNumber,
                    paymentId: intentResponse.id,
                    paymentLink,
                    course: { connect: { id: courseDetails.courseId } },
                    lead: { connect: { id: lead.id } },
                    user: { connect: { id: user.id } },
                    courseType: { id: courseDetails.courseId, isPrivate: courseDetails.isPrivate }
                },
                include: {
                    course: true,
                    user: true,
                    lead: { include: { assignee: { include: { user: true } } } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "OrderCreated",
                    course: { connect: { id: courseDetails.courseId } },
                    user: { connect: { id: user.id } },
                }
            })

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Quick Order Placed by ${salesAgentUser.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: user.id } },
                    messages: [{
                        message: `An order was placed by ${salesAgentUser.name} for Student ${user.name} regarding course ${course.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: salesAgentUser.id } },
                }
            })

            const html = await EmailsWrapper({
                EmailComp: Email,
                props: {
                    orderCreatedAt: format(order.createdAt, "dd MMM yyyy"),
                    userEmail: user.email,
                    orderAmount: formatPrice(order.amount),
                    orderNumber: orderNumber,
                    paymentLink: paymentLink,
                    customerName: user.name,
                    course: {
                        courseName: course.name,
                        coursePrice: order.courseType.isPrivate
                            ? formatPrice(course.privatePrice)
                            : formatPrice(course.groupPrice)
                    },
                },
                prisma: ctx.prisma
            })

            const tier = env.TIER
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({
                html,
                subject: `Thanks for your order ${orderNumber}`,
                email: user.email,
            })
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendWhatsAppMessage({
                prisma: ctx.prisma,
                toNumber: user.phone,
                type: "OrderPlaced",
                variables: {
                    name: user.name,
                    orderNumber,
                    orderTotal: formatPrice(totalPrice),
                    paymentLink
                }
            })

            return {
                order,
                password,
                user,
                paymentLink,
            };
        }),
    resendPaymentLink: protectedProcedure
        .input(z.object({
            orderId: z.string()
        }))
        .mutation(async ({ input: { orderId }, ctx }) => {
            const order = await ctx.prisma.order.findUnique({ where: { id: orderId }, include: { course: true, user: true } })

            if (!order || !order.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "order not found" })

            const sendTheMail = async (order: Order & {
                user: User;
                course: Course;
            }, paymentLink: string) => {
                await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Payment Link resent by ${ctx.session.user.name}`,
                        type: "Info",
                        createdForStudent: { connect: { id: order.user.id } },
                        messages: [{
                            message: `Payment Link: ${paymentLink} was resent to the user`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                    }
                })


                const html = await EmailsWrapper({
                    EmailComp: Email,
                    prisma: ctx.prisma,
                    props: {
                        orderCreatedAt: format(order.createdAt, "dd MMM yyyy"),
                        userEmail: order.user.email,
                        orderAmount: formatPrice(order.amount),
                        orderNumber: order.orderNumber,
                        paymentLink: paymentLink,
                        customerName: order.user.name,
                        course: {
                            courseName: order.course.name,
                            coursePrice: order.courseType.isPrivate
                                ? formatPrice(order.course.privatePrice)
                                : formatPrice(order.course.groupPrice)
                        },
                    }
                })

                const tier = env.TIER
                !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({ html, email: order.user.email, subject: `Thanks for your order ${order.orderNumber}` })
                !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendWhatsAppMessage({
                    prisma: ctx.prisma,
                    toNumber: order.user.phone,
                    type: "OrderPlaced",
                    variables: {
                        name: order.user.name,
                        orderNumber: order.orderNumber,
                        orderTotal: formatPrice(order.amount),
                        paymentLink
                    }
                })

                return {
                    isSuccess: true,
                }
            }

            if (order.paymentLink) {
                return await sendTheMail(order, order.paymentLink)
            } else {
                const coursesPrice = await ctx.prisma.course.findMany({
                    where: {
                        id: order.courseId
                    }
                })

                const intentData = {
                    special_reference: order.orderNumber,
                    amount: formatAmountForPaymob(order.amount),
                    currency: "EGP",
                    payment_methods: [4618117, 4617984],
                    items: coursesPrice.map(course => ({
                        name: course.name,
                        amount: formatAmountForPaymob(order.courseType.isPrivate ? course.privatePrice : course.groupPrice),
                        description: course.description,
                        quantity: 1,
                    })),
                    billing_data: {
                        first_name: order.user.name.split(" ")[0],
                        last_name: order.user.name.split(" ")[-1] || "No last name",
                        phone_number: order.user.phone,
                        email: order.user.email,
                    },
                    customer: {
                        first_name: order.user.name.split(" ")[0],
                        last_name: order.user.name.split(" ")[-1] || "No last name",
                        email: order.user.email,
                    },
                };

                const intentConfig = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${env.PAYMOB_BASE_URL}/v1/intention/`,
                    headers: {
                        'Authorization': `Token ${env.PAYMOB_API_SECRET}`,
                        'Content-Type': 'application/json'
                    },
                    data: intentData
                };

                const intentResponse = (await axios.request(intentConfig)).data
                if (!intentResponse.client_secret) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "intent failed" })

                const paymentLink = `${env.PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${env.PAYMOB_PUBLIC_KEY}&clientSecret=${intentResponse.client_secret}`

                const newOrder = await ctx.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentId: intentResponse.id,
                    },
                    include: {
                        course: true,
                        user: true,
                        lead: { include: { assignee: { include: { user: true } } } }
                    },
                });

                return await sendTheMail(newOrder, paymentLink)
            }
        }),
    payOrderManually: protectedProcedure
        .input(z.object({
            id: z.string(),
            amount: z.string(),
            paymentConfirmationImage: z.string(),
        }))
        .mutation(async ({ input: { id, amount, paymentConfirmationImage }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "pay")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update payments, Please contact your Admin!" })
            const order = await ctx.prisma.order.findUnique({ where: { id }, include: { user: true, course: true } })

            if (!order?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })
            if (!order?.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })

            const courseLink = `${process.env.NEXTAUTH_URL}my_courses`

            if (order.status === "Paid" || order.status === "Refunded")
                return ({
                    updatedOrder: order,
                    courseLink: null
                })

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    amount: Number(amount),
                    paymentConfirmationImage,
                    status: "Paid",
                },
                include: {
                    course: true,
                    lead: true,
                    user: true,
                }
            })

            const courseStatus = await ctx.prisma.courseStatus.updateMany({
                where: {
                    courseId: order.courseId
                },
                data: {
                    status: "OrderPaid",
                }
            })

            const note = await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Order was Paid manually by ${ctx.session.user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: order.user.id } },
                    messages: [{
                        message: `Payment Confirmation Link: ${paymentConfirmationImage}\nConfirmed by: ${ctx.session.user.name}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: ctx.session.user.id } },
                }
            })

            const html = await EmailsWrapper({
                EmailComp: PaymentConfEmail,
                prisma: ctx.prisma,
                props: {
                    orderCreatedAt: format(updatedOrder.createdAt, "dd MMM yyyy"),
                    orderUpdatedAt: format(updatedOrder.updatedAt, "dd MMM yyyy"),
                    userEmail: updatedOrder.user.email,
                    orderAmount: formatPrice(updatedOrder.amount),
                    orderNumber: updatedOrder.orderNumber,
                    courseLink,
                    customerName: updatedOrder.user.name,
                    course: {
                        courseName: updatedOrder.course.name,
                        coursePrice: updatedOrder.courseType.isPrivate
                            ? formatPrice(updatedOrder.course.privatePrice)
                            : formatPrice(updatedOrder.course.groupPrice)
                    }
                }
            })

            const tier = env.TIER
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({ html, email: updatedOrder.user.email, subject: `Payment successfull ${updatedOrder.orderNumber}` })
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendWhatsAppMessage({
                prisma: ctx.prisma, toNumber: updatedOrder.user.phone, type: "OrderPaid", variables: {
                    name: updatedOrder.user.name,
                    orderNumber: updatedOrder.orderNumber,
                    coursesLink: courseLink,
                    paymentAmount: formatPrice(updatedOrder.amount),
                }
            })

            return { courseLink, updatedOrder, courseStatus, note }
        }),
    payOrder: publicProcedure
        .input(
            z.object({
                transactionId: z.string(),
                orderNumber: z.string(),
            })
        )
        .mutation(async ({ ctx, input: { orderNumber, transactionId } }) => {
            const order = await ctx.prisma.order.findFirst({
                where: {
                    orderNumber,
                },
                include: {
                    course: true,
                    lead: true,
                    user: true,
                }
            })

            if (!order?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })
            const courseLink = `${process.env.NEXTAUTH_URL}my_courses`

            if (order.status === "Paid" || order.status === "Refunded")
                return ({
                    updatedOrder: order,
                    courseLink: null
                })

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    status: "Paid",
                    paymentId: transactionId,
                },
                include: {
                    course: true,
                    lead: true,
                    user: true,
                }
            })

            const courseStatus = await ctx.prisma.courseStatus.updateMany({
                where: {
                    courseId: order.courseId
                },
                data: {
                    status: "OrderPaid",
                }
            })

            const note = await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Order was Paid by the customer`,
                    type: "Info",
                    createdForStudent: { connect: { id: order.user.id } },
                    messages: [{
                        message: `Payment Confirmation Number: ${transactionId}\nOrder Number: ${updatedOrder.orderNumber}\n`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { email: "system@mail.com" } },
                }
            })

            const html = await EmailsWrapper({
                EmailComp: PaymentConfEmail,
                prisma: ctx.prisma,
                props: {
                    orderCreatedAt: format(updatedOrder.createdAt, "dd MMM yyyy"),
                    orderUpdatedAt: format(updatedOrder.updatedAt, "dd MMM yyyy"),
                    userEmail: updatedOrder.user.email,
                    orderAmount: formatPrice(updatedOrder.amount),
                    orderNumber: updatedOrder.orderNumber,
                    courseLink,
                    customerName: updatedOrder.user.name,
                    course: {
                        courseName: updatedOrder.course.name,
                        coursePrice: updatedOrder.courseType.isPrivate
                            ? formatPrice(updatedOrder.course.privatePrice)
                            : formatPrice(updatedOrder.course.groupPrice)
                    }
                }
            })

            const tier = env.TIER
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendZohoEmail({ html, email: updatedOrder.user.email, subject: `Payment successfull ${updatedOrder.orderNumber}` })
            !subscriptionTiers[tier as keyof typeof subscriptionTiers].onlinePayment ? null : await sendWhatsAppMessage({
                prisma: ctx.prisma, toNumber: updatedOrder.user.phone, type: "OrderPaid", variables: {
                    name: updatedOrder.user.name,
                    orderNumber: updatedOrder.orderNumber,
                    coursesLink: courseLink,
                    paymentAmount: formatPrice(updatedOrder.amount),
                }
            })

            return { courseLink, updatedOrder, courseStatus, note }
        }),
    refundOrder: protectedProcedure
        .input(z.object({
            orderId: z.string(),
        }))
        .mutation(async ({ input: { orderId }, ctx }) => {
            if (!hasPermission(ctx.session.user, "orders", "update")) throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update payments, Please contact your Admin!" })
            const userId = ctx.session.user.id
            const user = await ctx.prisma.user.findUnique({ where: { id: userId } })
            if (!user?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Requester user don't exist!" })

            const order = await ctx.prisma.order.findUnique({ where: { id: orderId } })
            if (!order?.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "order don't have a payment id, please refund manually" })

            if (!order.paymentConfirmationImage) {
                const data = {
                    transaction_id: order.paymentId,
                    amount_cents: formatAmountForPaymob(order.amount)
                };

                const config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${env.PAYMOB_BASE_URL}/api/acceptance/void_refund/refund`,
                    headers: {
                        'Authorization': `Token ${env.PAYMOB_API_SECRET}`,
                        'Content-Type': 'application/json'
                    },
                    data: data
                };

                const refundData = (await axios.request(config)).data
                if (refundData.data.klass === "WalletRefund") throw new TRPCError({ code: "BAD_REQUEST", message: "unable to refund wallet payments, please send the refund back manually!" })

                const isRefunded = refundData.success === true;

                if (!isRefunded) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "refund failed!" })

                const updatedOrder = await ctx.prisma.order.update({
                    where: {
                        id: orderId,
                    },
                    data: {
                        status: "Refunded",
                        refundId: `${refundData.id}`,
                        refundRequester: user.id
                    },
                    include: { course: true }
                });

                const statuses = await ctx.prisma.courseStatus.findMany({
                    where: { userId: order.userId, courseId: order.courseId },
                    orderBy: { createdAt: "desc" },
                })
                const updatedStatus = await ctx.prisma.courseStatus.update({
                    where: { id: statuses[0]?.id },
                    data: {
                        status: "Refunded"
                    }
                })

                const note = await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Order was Refunded by ${ctx.session.user.name}`,
                        type: "Info",
                        createdForStudent: { connect: { id: user.id } },
                        messages: [{
                            message: `Order Refunded and access revoked for course ${updatedOrder.course.name}`,
                            updatedAt: new Date(),
                            updatedBy: "System"
                        }],
                        createdByUser: { connect: { id: ctx.session.user.id } },
                    }
                })

                return { success: isRefunded, refundData, updatedOrder, updatedStatus, requestedBy: user, note };
            }

            const statuses = await ctx.prisma.courseStatus.findMany({
                where: { userId: order.userId, courseId: order.courseId },
                orderBy: { createdAt: "desc" },
            })

            const updatedStatus = await ctx.prisma.courseStatus.update({
                where: { id: statuses[0]?.id },
                data: {
                    status: "Refunded"
                }
            })

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: "Refunded",
                    refundId: user.id,
                    refundRequester: user.id
                },
            });

            const updatedUser = await ctx.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    courseStatus: {
                        deleteMany: {
                            courseId: order.courseId
                        }
                    }
                },
            });

            return { success: true, updatedOrder, requestedBy: user, updatedUser, updatedStatus };
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
});
