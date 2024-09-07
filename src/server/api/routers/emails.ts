import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
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
            const isSuccess = await sendZohoEmail({
                email,
                html: `name: ${name} email: ${email} message: ${message}`,
                subject: `${name}: ${message.split(" ").slice(0, 10).join(" ")}`,
            })

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
            const isSuccess = await sendZohoEmail({ email, subject, html: message })

            return { isSuccess }
        }),
});
