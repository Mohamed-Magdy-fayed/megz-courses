import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { formatPrice, orderCodeGenerator, salesOperationCodeGenerator } from "@/lib/utils";
import Stripe from "stripe";
import { CURRENCY } from "@/config";
import { TRPCError } from "@trpc/server";
import { render } from "@react-email/render";
import Email from "@/components/emails/Email";
import { format } from "date-fns";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";
import axios from "axios";
import { formatAmountForPaymob } from "@/lib/paymobHelpers";

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
            if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to get user" })

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

            const intentData = {
                amount: formatAmountForPaymob(price),
                currency: "EGP",
                payment_methods: [4618117, 4617984],
                items: [
                    {
                        name: course.name,
                        amount: formatAmountForPaymob(price),
                        description: course.description,
                        quantity: 1,
                    }
                ],
                billing_data: {
                    first_name: user.name.split(" ")[0],
                    last_name: user.name.split(" ")[-1],
                    phone_number: user.phone,
                    email: user.email,
                },
                customer: {
                    first_name: user.name.split(" ")[0],
                    last_name: user.name.split(" ")[-1],
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

            const order = await ctx.prisma.order.create({
                data: {
                    amount: price,
                    orderNumber: orderCodeGenerator(),
                    paymentId: intentResponse.id,
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

            const logoUrl = (await ctx.prisma.siteIdentity.findFirst())?.logoPrimary

            const message = render(
                <Email
                    logoUrl={logoUrl || ""}
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
