import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { orderCodeGenerator, salesOperationCodeGenerator } from "@/lib/utils";
import { CURRENCY } from "@/config";
import { TRPCError } from "@trpc/server";
import Stripe from 'stripe'
import { formatAmountForStripe } from "@/lib/stripeHelpers";
import { User } from "@prisma/client";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-08-16',
})

export const ordersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                user: true,
                salesOperation: { include: { assignee: true } },
                courses: true,
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
                courses: true,
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
                    courses: true,
                },
            });
            return { order };
        }),
    createOrder: protectedProcedure
        .input(
            z.object({
                coursesDetails: z.array(z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                })),
                salesOperationId: z.string(),
                email: z.string().email(),
            })
        )
        .mutation(async ({ input: { coursesDetails, salesOperationId, email }, ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    email
                },
            })

            const foundMatchingCourse = coursesDetails.some(({ courseId }) => {
                return user?.courseStatus.some((status) => status.courseId === courseId)
            });

            if (foundMatchingCourse) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'One or more courses are already in progress or completed by the user.',
                });
            }

            const courses = await ctx.prisma.course.findMany({
                where: {
                    id: { in: coursesDetails.map(course => course.courseId) }
                }
            })
            const totalPrice = courses.map(course => coursesDetails.find(({
                courseId
            }) => course.id === courseId)?.isPrivate ? course.privatePrice : course.groupPrice)
                .reduce((accumulator, value) => {
                    return accumulator + value;
                }, 0);

            // Create Checkout Sessions from body params.
            const params: Stripe.Checkout.SessionCreateParams = {
                submit_type: 'pay',
                payment_method_types: ['card'],
                line_items: courses.map(course => ({
                    price_data: {
                        currency: CURRENCY,
                        unit_amount: formatAmountForStripe(coursesDetails.find(({
                            courseId
                        }) => course.id === courseId)?.isPrivate ? course.privatePrice : course.groupPrice, CURRENCY),
                        product_data: {
                            name: course.name,
                            description: course.description || `No description`,
                            images: course.image ? [course.image] : undefined,
                        },
                    },
                    quantity: 1
                })),
                mode: 'payment',
                success_url: `${process.env.NEXTAUTH_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXTAUTH_URL}/payment_fail`,
            }
            const checkoutSession: Stripe.Checkout.Session =
                await stripe.checkout.sessions.create(params)

            if (!checkoutSession) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "checkoutSession failed" })

            const order = await ctx.prisma.order.create({
                data: {
                    amount: totalPrice,
                    orderNumber: orderCodeGenerator(),
                    paymentId: checkoutSession.id,
                    courses: { connect: coursesDetails.map(({ courseId }) => ({ id: courseId })) },
                    salesOperation: { connect: { id: salesOperationId } },
                    user: { connect: { email } },
                    courseTypes: coursesDetails.map(({ courseId, isPrivate }) => ({ id: courseId, isPrivate }))
                },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            return {
                order,
                paymentLink: `${process.env.NEXTAUTH_URL}payments?sessionId=${checkoutSession.id}`
            };
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
        .mutation(async ({ input: { courseDetails, email, name }, ctx }) => {
            let user: User | null
            if (!email && !!name) {
                console.log(`${name?.replaceAll(" ", "")}${(Math.random() * 10000).toFixed()}@temp.com`);

                user = await ctx.prisma.user.create({
                    data: { name, email: `${name?.replaceAll(" ", "")}${(Math.random() * 10000).toFixed()}@temp.com` }
                })
            } else {
                user = await ctx.prisma.user.findUnique({
                    where: { email },
                })
            }
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to get user" })

            const salesAgent = await ctx.prisma.user.findUnique({
                where: {
                    id: ctx.session.user.id
                },
            })
            if (!salesAgent) throw new TRPCError({ code: "BAD_REQUEST", message: "Not a sales agent!" })
            const salesAgentId = salesAgent.id

            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseDetails.courseId
                }
            })
            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "Course not found!" })

            const totalPrice = courseDetails.isPrivate ? course.privatePrice : course.groupPrice

            // Create Checkout Sessions from body params.
            const params: Stripe.Checkout.SessionCreateParams = {
                submit_type: 'pay',
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: CURRENCY,
                        unit_amount: formatAmountForStripe(totalPrice, CURRENCY),
                        product_data: {
                            name: course.name,
                            description: course.description || `No description`,
                            images: course.image ? [course.image] : undefined,
                        },
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: `${process.env.NEXTAUTH_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXTAUTH_URL}/payment_fail`,
            }
            const checkoutSession: Stripe.Checkout.Session =
                await stripe.checkout.sessions.create(params)

            if (!checkoutSession) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "checkoutSession failed" })

            const salesOperation = await ctx.prisma.salesOperation.create({
                data: {
                    assignee: { connect: { userId: salesAgentId } },
                    code: salesOperationCodeGenerator(),
                    status: "ongoing",
                }
            })
            if (!salesOperation) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "create salesOperation failed" })

            const order = await ctx.prisma.order.create({
                data: {
                    amount: totalPrice,
                    orderNumber: orderCodeGenerator(),
                    paymentId: checkoutSession.id,
                    courses: { connect: { id: courseDetails.courseId } },
                    salesOperation: { connect: { id: salesOperation.id } },
                    user: { connect: { id: user.id } },
                    courseTypes: [{ id: courseDetails.courseId, isPrivate: courseDetails.isPrivate }]
                },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            return {
                order,
                paymentLink: `${process.env.NEXTAUTH_URL}payments?sessionId=${checkoutSession.id}`
            };
        }),
    resendPaymentLink: protectedProcedure
        .input(z.object({
            orderId: z.string()
        }))
        .mutation(async ({ input: { orderId }, ctx }) => {
            const order = await ctx.prisma.order.findUnique({ where: { id: orderId }, include: { courses: true, user: true } })

            if (!order || !order.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "order not found" })
            if ((await stripe.checkout.sessions.retrieve(order.paymentId)).status === "open") await stripe.checkout.sessions.expire(order.paymentId)

            const coursesPrice = await ctx.prisma.course.findMany({
                where: {
                    id: { in: order?.courseIds }
                }
            })

            // Create Checkout Sessions from body params.
            const params: Stripe.Checkout.SessionCreateParams = {
                submit_type: 'pay',
                payment_method_types: ['card'],
                line_items: coursesPrice.map(course => ({
                    price_data: {
                        currency: CURRENCY,
                        unit_amount: formatAmountForStripe(order.courseTypes.find(({
                            id,
                        }) => course.id === id)?.isPrivate ? course.privatePrice : course.groupPrice, CURRENCY),
                        product_data: {
                            name: course.name,
                            description: course.description || `No description`,
                            images: [course.image || ""],
                        },
                    },
                    quantity: 1
                })),
                mode: 'payment',
                success_url: `${process.env.NEXTAUTH_URL}/payment_success?session_id={CHECKOUT_SESSION_ID}&payment_intent={payment_intent}`,
                cancel_url: `${process.env.NEXTAUTH_URL}/payment_fail`,
            }
            const checkoutSession: Stripe.Checkout.Session =
                await stripe.checkout.sessions.create(params)

            if (!checkoutSession) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "checkoutSession failed" })

            const updatedOrder = await ctx.prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentId: checkoutSession.id,
                },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            return {
                updatedOrder,
                paymentLink: `${process.env.NEXTAUTH_URL}payments?sessionId=${checkoutSession.id}`
            };
        }),
    payOrderManually: protectedProcedure
        .input(z.object({
            id: z.string(),
            amount: z.string(),
            paymentConfirmationImage: z.string(),
        }))
        .mutation(async ({ input: { id, amount, paymentConfirmationImage }, ctx }) => {
            const order = await ctx.prisma.order.findUnique({ where: { id }, include: { user: true } })

            if (!order?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })
            if (!order?.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })

            const courseLink = `${process.env.NEXTAUTH_URL}my_courses/${order.user.id}`

            if (order.status === "paid" || order.status === "refunded")
                return ({
                    updatedOrder: order,
                    courseLink: null
                })

            if ((await stripe.checkout.sessions.retrieve(order.paymentId)).status === "open") await stripe.checkout.sessions.expire(order.paymentId)

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
                    courses: true,
                    salesOperation: true,
                    user: true,
                }
            })

            return { courseLink, updatedOrder }
        }),
    payOrder: protectedProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .mutation(async ({ ctx, input: { sessionId } }) => {
            const session = await stripe.checkout.sessions.retrieve(sessionId)
            const paymentIntentId = `${session.payment_intent}`

            const order = await ctx.prisma.order.findFirst({
                where: {
                    paymentId: {
                        in: [sessionId, paymentIntentId]
                    }
                },
                include: {
                    courses: true,
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
                    paymentId: paymentIntentId,
                },
                include: {
                    courses: true,
                    salesOperation: true,
                    user: true,
                }
            })


            return { courseLink, updatedOrder }
        }),
    refundOrder: protectedProcedure
        .input(z.object({
            userId: z.string(),
            orderId: z.string(),
            reason: z.enum(["requested_by_customer", "duplicate", "fraudulent"]),
        }))
        .mutation(async ({ input: { orderId, userId, reason }, ctx }) => {
            const user = await ctx.prisma.user.findUnique({ where: { id: userId } })
            if (!user?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "Requester user don't exist!" })
            const order = await ctx.prisma.order.findUnique({ where: { id: orderId } })
            if (!order?.paymentId) throw new TRPCError({ code: "BAD_REQUEST", message: "order don't have a payment id, please refund manually" })

            const refund = await stripe.refunds.create({
                payment_intent: order.paymentId,
                reason,
                metadata: {
                    refundedBy: user.email
                }
            });

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: "refunded",
                    refundId: refund.id,
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
                            where: {
                                courseId: {
                                    in: order.courseIds
                                }
                            }
                        }
                    }
                },
            });

            return { success: refund.status === "succeeded", refund, updatedOrder, requestedBy: user, updatedUser };
        }),
    editOrder: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                coursesDetails: z.array(z.object({
                    courseId: z.string(),
                    isPrivate: z.boolean(),
                })),
            })
        )
        .mutation(async ({ ctx, input: { id, coursesDetails } }) => {
            const courses = await ctx.prisma.course.findMany({
                where: {
                    id: { in: coursesDetails.map(({ courseId }) => courseId) }
                }
            })
            const totalPrice = courses.map(course => coursesDetails.find(({
                courseId
            }) => course.id === courseId)?.isPrivate ? course.privatePrice : course.groupPrice)
                .reduce((accumulator, value) => {
                    return accumulator + value;
                }, 0);

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id,
                },
                data: {
                    amount: totalPrice,
                    courses: { connect: coursesDetails.map(({ courseId }) => ({ id: courseId })) },
                },
                include: {
                    courses: true,
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
