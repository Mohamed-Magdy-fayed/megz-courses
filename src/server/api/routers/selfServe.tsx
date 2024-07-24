import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { formatPrice, orderCodeGenerator, salesOperationCodeGenerator } from "@/lib/utils";
import Stripe from "stripe";
import { CURRENCY } from "@/config";
import { formatAmountForStripe } from "@/lib/stripeHelpers";
import { TRPCError } from "@trpc/server";
import { render } from "@react-email/render";
import Email from "@/components/emails/Email";
import { format } from "date-fns";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-08-16',
})

export const selfServeRouter = createTRPCRouter({
    enrollCourse: protectedProcedure
        .input(z.object({
            customerName: z.string(),
            email: z.string(),
            courseId: z.string(),
            isPrivate: z.boolean().optional(),
        }))
        .mutation(async ({ input: { courseId, email, customerName, isPrivate }, ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    email
                },
                include: { courseStatus: true }
            })

            const foundMatchingCourse = user?.courseStatus.some((status) => status.courseId === courseId)

            if (foundMatchingCourse) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'This course is already in progress or completed by the user.',
                });
            }

            const salesOperation = await ctx.prisma.salesOperation.create({
                data: {
                    code: salesOperationCodeGenerator(),
                    status: "created",
                },
            })

            const course = await ctx.prisma.course.findUnique({
                where: {
                    id: courseId
                }
            })

            if (!course) throw new TRPCError({ code: "BAD_REQUEST", message: "course not found" })

            const price = isPrivate ? course.privatePrice : course.groupPrice

            // Create Checkout Sessions from body params.
            const params: Stripe.Checkout.SessionCreateParams = {
                submit_type: 'pay',
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: CURRENCY,
                        unit_amount: formatAmountForStripe(price, CURRENCY),
                        product_data: {
                            name: course.name,
                            description: course.description || `No description`,
                            images: !course.image ? undefined : [course.image],
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

            const order = await ctx.prisma.order.create({
                data: {
                    amount: price,
                    orderNumber: orderCodeGenerator(),
                    paymentId: checkoutSession.id,
                    courses: { connect: { id: course.id } },
                    salesOperation: { connect: { id: salesOperation.id } },
                    user: { connect: { email } },
                    courseTypes: [{
                        id: course.id,
                        isPrivate: isPrivate ? isPrivate : false,
                    }]
                },
                include: {
                    courses: true,
                    user: true,
                    salesOperation: { include: { assignee: true } }
                },
            });

            const paymentLink = `${process.env.NEXTAUTH_URL}payments?sessionId=${checkoutSession.id}`

            const message = render(
                <Email
                    orderCreatedAt={format(order.createdAt, "dd MMM yyyy")}
                    userEmail={email}
                    orderAmount={formatPrice(order.amount)}
                    orderNumber={order.orderNumber}
                    paymentLink={paymentLink}
                    customerName={customerName}
                    courses={[{ courseName: course.name, coursePrice: formatPrice(price) }]}
                />, { pretty: true }
            )

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: env.GMAIL_EMAIL,
                    pass: env.GMAIL_PASS,
                },
            });

            const mailOptions = {
                from: env.GMAIL_EMAIL,
                to: email,
                subject: `Thanks for your order ${order.orderNumber}`,
                html: message,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "mail sending failed" })
                return info
            });

            return {
                salesOperation,
                course,
                order,
                paymentLink,
            }
        }),
});
