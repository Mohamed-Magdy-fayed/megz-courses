import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "@/server/api/trpc";
import axios from "axios";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";
import { orderCodeGenerator } from "@/lib/utils";

export const commsRouter = createTRPCRouter({
    sendWhatsappMessage: protectedProcedure
        .input(
            z.object({
                phoneNumber: z.number(),
                message: z.string(),
            })
        )
        .query(async ({ ctx, input: { message, phoneNumber } }) => {
            // POST https://api.greenapi.com/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}

            const data = {
                "chatId": "11001234567@c.us",
                "message": "I use Green-API to send this message to you!"
            }

            const res = await axios.post(`https://api.greenapi.com/waInstance{{idInstance}}/sendMessage/{{apiTokenInstance}}`, { data })
            const messageId = await res.data
            console.log(res);



            return { messageId };
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
                    return { error: "unable to send mail!" };
                }
                console.log(info);
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
