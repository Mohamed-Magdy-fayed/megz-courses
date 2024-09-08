import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
} from "@/server/api/trpc";
import nodemailer from "nodemailer";
import { env } from "@/env.mjs";

export const emailsRouter = createTRPCRouter({
    sendZohoEmail: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                subject: z.string(),
                html: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const transporter = nodemailer.createTransport({
                host: "smtp.zoho.com",
                port: 465,
                secure: true,
                auth: {
                    user: env.ZOHO_MAIL,
                    pass: env.ZOHO_PASS,
                },
            });

            const mailOptions = {
                from: env.ZOHO_MAIL,
                to: input.email,
                subject: input.subject,
                html: input.html,
            };

            try {
                await transporter.sendMail(mailOptions);
                return { success: true, message: "Email sent successfully" };
            } catch (error) {
                console.error("Error sending email:", error);
                throw new Error("Error sending email");
            }
        }),
});
