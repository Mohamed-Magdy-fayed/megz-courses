import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";
import { sendZohoEmail } from "@/lib/gmailHelpers";

export const emailsRouter = createTRPCRouter({
    sendWhatsappMessage: publicProcedure
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
    sendEmail: protectedProcedure
        .input(
            z.object({
                email: z.string().email(),
                message: z.string(),
                subject: z.string(),
            })
        )
        .mutation(async ({
            input: {
                message,
                email,
                subject,
            } }) => {
            const isSuccess = sendZohoEmail({ email, subject, html: message })

            return { isSuccess }
        }),
});
