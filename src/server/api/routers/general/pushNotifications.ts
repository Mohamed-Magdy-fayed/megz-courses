import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { Message } from "firebase-admin/lib/messaging/messaging-api";
import { firebaseAdmin } from "@/server/firebase-admin";

export const pushNotificationsRouter = createTRPCRouter({
    saveToken: protectedProcedure
        .input(z.object({
            token: z.string(),
        }))
        .mutation(async ({ input: { token }, ctx }) => {
            const currentUser = await ctx.prisma.user.findUnique({ where: { id: ctx.session.user.id } })
            if (!currentUser) return token

            if (currentUser.fcmTokens.some(t => t === token)) return token

            await ctx.prisma.user.update({ where: { id: ctx.session.user.id }, data: { fcmTokens: { push: token } } })
            return token
        }),
    removeToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            return await ctx.prisma.user.update({ where: { id: ctx.session.user.id }, data: { fcmTokens: [] } })
        }),
});
