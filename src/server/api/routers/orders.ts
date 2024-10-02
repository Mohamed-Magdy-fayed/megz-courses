import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { formatPrice, orderCodeGenerator, salesOperationCodeGenerator } from "@/lib/utils";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { Course, Order, User } from "@prisma/client";
import { randomUUID } from "crypto";
import { env } from "@/env.mjs";
import axios from "axios";
import { createPaymentIntent, formatAmountForPaymob } from "@/lib/paymobHelpers";
import { format } from "date-fns";

export const ordersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                user: true,
                salesOperation: { include: { assignee: true } },
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
                salesOperation: { include: { assignee: true } },
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
                    salesOperation: { include: { assignee: true } },
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
                    salesOperation: { include: { assignee: true } },
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
                    salesOperation: { include: { assignee: true } },
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
                salesOperationId: z.string(),
                email: z.string().email(),
            })
        )
        .mutation(async ({ input: { courseDetails, salesOperationId, email }, ctx }) => {
            if (ctx.session.user.userType !== "admin" && ctx.session.user.userType !== "salesAgent") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to create orders, Please contact your admin!" })
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
                    message: 'One or more courses are already in progress or completed by the user.',
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
                    salesOperation: { connect: { id: salesOperationId } },
                    user: { connect: { email } },
                    courseType: { id: courseDetails.courseId, isPrivate: courseDetails.isPrivate }
                },
                include: {
                    course: true,
                    user: true,
                    salesOperation: { include: { assignee: { include: { user: true } } } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "orderCreated",
                    course: { connect: { id: courseDetails.courseId } },
                    user: { connect: { id: user.id } },
                }
            })

            await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `An Order Placed by ${order.salesOperation.assignee?.user.name}`,
                    type: "Info",
                    createdForStudent: { connect: { id: user.id } },
                    messages: [{
                        message: `An order was placed by ${order.salesOperation.assignee?.user.name} for student ${user.name} regarding course ${course?.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: order.salesOperation.assignee?.user.id } },
                }
            })

            const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary

            return {
                orderNumber,
                emailProps: {
                    logoUrl: logoUrl || "",
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
                }
            }
        }),
    quickOrder: protectedProcedure
        .input(
            z.object({
                courseDetails: z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                }),
                email: z.string().email().optional(),
                name: z.string().optional(),
                phone: z.string().optional(),
            }).refine(({ email, name }) => {
                if (!email && !name) {
                    return false;
                }
                if (email && name) {
                    return false;
                }
                return true;
            },
                {
                    message: 'Either email or name must be provided, but not both.',
                    path: ['email', 'name'],
                })
        )
        .mutation(async ({ input: { courseDetails, email, name, phone }, ctx }) => {
            if (
                ctx.session.user.userType !== "admin"
                && ctx.session.user.userType !== "salesAgent"
                && ctx.session.user.userType !== "chatAgent"
            ) throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "You are not authorized to create orders, Please contact your admin!"
            })

            let user: User | null
            let password = ""
            if (!email && !!name) {
                password = "@P" + randomUUID().toString().split("-")[0] as string;
                const hashedPassword = await bcrypt.hash(password, 10);

                user = await ctx.prisma.user.create({
                    data: {
                        name,
                        email: `${name?.replaceAll(" ", "").toLocaleLowerCase()}${(Math.random() * 10000).toFixed()}@temp.com`,
                        phone: phone?.replace("+", ""),
                        hashedPassword,
                        emailVerified: new Date()
                    }
                })
            } else {
                user = await ctx.prisma.user.findUnique({
                    where: { email },
                })
            }
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to get user" })

            const salesAgentUser = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id,
                },
                include: { salesAgent: true }
            })
            if (!salesAgentUser) throw new TRPCError({ code: "BAD_REQUEST", message: "No user found!" })
            const salesAgentId = salesAgentUser.id

            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseDetails.courseId
                }
            })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

            const totalPrice = courseDetails.isPrivate ? course.privatePrice : course.groupPrice
            const orderNumber = orderCodeGenerator()

            const intentData = {
                special_reference: orderNumber,
                amount: formatAmountForPaymob(totalPrice),
                currency: "EGP",
                payment_methods: [4618117, 4617984],
                items: [
                    {
                        name: course.name,
                        amount: formatAmountForPaymob(totalPrice),
                        description: course.description,
                        quantity: 1,
                    }
                ],
                billing_data: {
                    first_name: user.name.split(" ")[0],
                    last_name: user.name.split(" ")[-1] || "No last name",
                    phone_number: user.phone,
                    email: user.email,
                },
                customer: {
                    first_name: user.name.split(" ")[0],
                    last_name: user.name.split(" ")[-1] || "No last name",
                    email: user.email,
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

            const salesOperation = await ctx.prisma.salesOperation.create({
                data: {
                    assignee: { connect: { userId: salesAgentId } },
                    code: salesOperationCodeGenerator(),
                    status: "ongoing",
                }
            })
                .then(res => res)
                .catch(async (e) => {
                    if (
                        e.meta.cause.includes("No 'SalesAgent' record")
                        && (
                            ctx.session.user.userType === "admin"
                            || ctx.session.user.userType === "chatAgent"
                        )
                    ) {
                        await ctx.prisma.salesAgent.create({
                            data: {
                                salary: "0",
                                user: {
                                    connect: {
                                        id: ctx.session.user.id
                                    }
                                }
                            }
                        })

                        return await ctx.prisma.salesOperation.create({
                            data: {
                                assignee: { connect: { userId: salesAgentId } },
                                code: salesOperationCodeGenerator(),
                                status: "ongoing",
                            }
                        })

                    }
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.meta.cause })
                })
            if (!salesOperation) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "create salesOperation failed" })

            const order = await ctx.prisma.order.create({
                data: {
                    amount: totalPrice,
                    orderNumber,
                    paymentId: intentResponse.id,
                    paymentLink,
                    course: { connect: { id: courseDetails.courseId } },
                    salesOperation: { connect: { id: salesOperation.id } },
                    user: { connect: { id: user.id } },
                    courseType: { id: courseDetails.courseId, isPrivate: courseDetails.isPrivate }
                },
                include: {
                    course: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            await ctx.prisma.courseStatus.create({
                data: {
                    status: "orderCreated",
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
                        message: `An order was placed by ${salesAgentUser.name} for student ${user.name} regarding course ${course.name} for a ${order.courseType.isPrivate ? "private" : "group"} purchase the order is now awaiting payment\nPayment Link: ${paymentLink}`,
                        updatedAt: new Date(),
                        updatedBy: "System"
                    }],
                    createdByUser: { connect: { id: salesAgentUser.id } },
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

                const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary

                return {
                    isSuccess: true,
                    emailProps: {
                        logoUrl: logoUrl || "",
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
                        salesOperation: { include: { assignee: true } }
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
            if (ctx.session.user.userType !== "admin" && ctx.session.user.userType !== "salesAgent") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update payments, Please contact your admin!" })
            const order = await ctx.prisma.order.findUnique({ where: { id }, include: { user: true, course: true } })

            if (!order?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })
            if (!order?.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })

            const courseLink = `${process.env.NEXTAUTH_URL}my_courses`

            if (order.status === "paid" || order.status === "refunded")
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
                    status: "paid",
                },
                include: {
                    course: true,
                    salesOperation: true,
                    user: true,
                }
            })

            const courseStatus = await ctx.prisma.courseStatus.updateMany({
                where: {
                    courseId: order.courseId
                },
                data: {
                    status: "orderPaid",
                }
            })

            const note = await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Order was paid manually by ${ctx.session.user.name}`,
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
                    salesOperation: true,
                    user: true,
                }
            })

            if (!order?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })
            const courseLink = `${process.env.NEXTAUTH_URL}my_courses`

            if (order.status === "paid" || order.status === "refunded")
                return ({
                    updatedOrder: order,
                    courseLink: null
                })

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    status: "paid",
                    paymentId: transactionId,
                },
                include: {
                    course: true,
                    salesOperation: true,
                    user: true,
                }
            })

            const courseStatus = await ctx.prisma.courseStatus.updateMany({
                where: {
                    courseId: order.courseId
                },
                data: {
                    status: "orderPaid",
                }
            })

            const note = await ctx.prisma.userNote.create({
                data: {
                    sla: 0,
                    status: "Closed",
                    title: `Order was paid by the customer`,
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

            return { courseLink, updatedOrder, courseStatus, note }
        }),
    refundOrder: protectedProcedure
        .input(z.object({
            orderId: z.string(),
        }))
        .mutation(async ({ input: { orderId }, ctx }) => {
            if (ctx.session.user.userType !== "admin" && ctx.session.user.userType !== "salesAgent") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update payments, Please contact your admin!" })
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
                        status: "refunded",
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
                        status: "refunded"
                    }
                })

                const note = await ctx.prisma.userNote.create({
                    data: {
                        sla: 0,
                        status: "Closed",
                        title: `Order was refunded by ${ctx.session.user.name}`,
                        type: "Info",
                        createdForStudent: { connect: { id: user.id } },
                        messages: [{
                            message: `Order refunded and access revoked for course ${updatedOrder.course.name}`,
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
                    status: "refunded"
                }
            })

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: "refunded",
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
            if (ctx.session.user.userType !== "admin" && ctx.session.user.userType !== "salesAgent") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to update payments, Please contact your admin!" })
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
                    salesOperation: { include: { assignee: true } }
                },
            });

            return { updatedOrder };
        }),
    deleteOrders: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ input, ctx }) => {
            if (ctx.session.user.userType !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized to take this action, please contact your admin!" })
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
