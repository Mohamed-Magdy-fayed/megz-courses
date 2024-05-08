import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";
import { orderCodeGenerator } from "@/lib/utils";
import { TRPCError } from "@trpc/server";

export const emailsRouter = createTRPCRouter({
    sendWhatsappMessage: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                message: z.string(),
            })
        )
        .mutation(async ({ input: { message, email, name } }) => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: env.GMAIL_EMAIL,
                    pass: env.GMAIL_PASS,
                },
            });

            const mailOptions = {
                from: email,
                to: env.GMAIL_EMAIL,
                subject: `${name}: ${message.split(" ").slice(0, 10).join(" ")}`,
                text: `name: ${name} email: ${email} message: ${message}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "unable to send mail!" });
                }
                return info
            });

            return { message: "your message is recieved, we will get back to you as soon as possible!" };
        }),
    sendEmail: protectedProcedure.input(
        z.object({
            email: z.string().email(),
            message: z.string(),
            subject: z.string(),
            orderId: z.string(),
            salesOperationId: z.string(),
            alreadyUpdated: z.boolean(),
        })
    ).mutation(async ({
        ctx,
        input: {
            message,
            email,
            subject,
            orderId,
            salesOperationId,
            alreadyUpdated,
        } }) => {
        const order = await ctx.prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                courses: true,
                salesOperation: {
                    include: {
                        assignee: {
                            include: { user: true }
                        }
                    }
                },
                user: true,
            }
        })

        if (!alreadyUpdated) {
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
                subject: subject,
                html: message,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "unable to send mail!" });
                }
                return info
            });
        }

        const updatedSalesOperations = await ctx.prisma.salesOperation.update({
            where: {
                id: salesOperationId,
            },
            data: {
                orderDetails: !email || !order?.amount ? undefined : {
                    connectOrCreate: {
                        where: { salesOperationId },
                        create: {
                            orderNumber: orderCodeGenerator(),
                            amount: order.amount,
                            user: { connect: { email } },
                        }
                    }
                }
            },
            include: {
                assignee: { include: { user: true, tasks: true } },
                orderDetails: true
            },
        });

        return { order, updatedSalesOperations, alreadyUpdated }
    })
});
