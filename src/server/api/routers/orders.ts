import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { orderCodeGenerator } from "@/lib/utils";
import { CURRENCY } from "@/config";
import { TRPCError } from "@trpc/server";
import Stripe from 'stripe'
import { formatAmountForStripe } from "@/lib/stripeHelpers";
import { env } from "@/env.mjs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-08-16',
})

export const ordersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const orders = await ctx.prisma.order.findMany({
            include: {
                courses: true,
                user: true,
                salesOperation: { include: { assignee: true } }
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
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });
            return { order };
        }),
    createOrder: protectedProcedure
        .input(
            z.object({
                courses: z.array(z.string()),
                salesOperationId: z.string(),
                email: z.string().email(),
            })
        )
        .mutation(async ({ input: { courses, salesOperationId, email }, ctx }) => {
            const coursesPrice = await ctx.prisma.course.findMany({
                where: {
                    id: { in: courses }
                }
            })
            const totalPrice = coursesPrice.map(course => course.price).reduce((accumulator, value) => {
                return accumulator + value;
            }, 0);

            // Create Checkout Sessions from body params.
            const params: Stripe.Checkout.SessionCreateParams = {
                submit_type: 'pay',
                payment_method_types: ['card'],
                line_items: coursesPrice.map(course => ({
                    price_data: {
                        currency: CURRENCY,
                        unit_amount: formatAmountForStripe(course.price, CURRENCY),
                        product_data: {
                            name: course.name,
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
                    courses: { connect: courses.map(c => ({ id: c })) },
                    salesOperation: { connect: { id: salesOperationId } },
                    user: { connect: { email } },
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
    payOrder: protectedProcedure
        .input(
            z.object({
                sessionId: z.string(),
            })
        )
        .mutation(async ({ ctx, input: { sessionId } }) => {
            const order = await ctx.prisma.order.findFirst({
                where: {
                    paymentId: sessionId
                },
                include: {
                    courses: true,
                    salesOperation: true,
                    user: true,
                }
            })

            if (!order?.id) throw new TRPCError({ code: "BAD_REQUEST", message: "incorrect information" })
            const courseLink = `${process.env.NEXTAUTH_URL}my_courses/${order.user.id}`

            if (order.status === "paid" || order.status === "done")
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
                },
                include: {
                    courses: true,
                    salesOperation: true,
                    user: true,
                }
            })


            return { courseLink, updatedOrder }
        }),
    editOrder: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                courses: z.array(z.string()),
            })
        )
        .mutation(async ({ ctx, input: { id, courses } }) => {
            const coursesPrice = await ctx.prisma.course.findMany({
                where: {
                    id: { in: courses }
                }
            })
            const totalPrice = coursesPrice.map(course => course.price).reduce((accumulator, value) => {
                return accumulator + value;
            }, 0);

            const updatedOrder = await ctx.prisma.order.update({
                where: {
                    id,
                },
                data: {
                    amount: totalPrice,
                    courses: { connect: courses.map(c => ({ id: c })) },
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
