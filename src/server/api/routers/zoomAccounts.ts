import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env.mjs";
import axios from "axios";
import QueryString from "qs";

export const zoomAccountsRouter = createTRPCRouter({
    getZoomAccounts: protectedProcedure
        .query(async ({ ctx }) => {
            const zoomAccounts = await ctx.prisma.zoomClient.findMany({ include: { zoomSessions: true } })
            return { zoomAccounts }
        }),
    getAvailableZoomClient: protectedProcedure
        .input(z.object({
            startDate: z.date()
        }))
        .mutation(async ({ ctx, input: { startDate } }) => {
            const zoomClients = await ctx.prisma.zoomClient.findMany({ include: { zoomSessions: true }, orderBy: { id: "desc" } })

            const availableClient = zoomClients.find(client => {
                return !client.zoomSessions.some(session => {
                    const sessionTime = session.sessionDate.getTime();
                    const startTime = startDate.getTime();
                    const twoHoursInMillis = 2 * 60 * 60 * 1000;

                    return sessionTime >= (startTime - twoHoursInMillis) && sessionTime <= (startTime + twoHoursInMillis);
                });
            });

            if (!availableClient) return { zoomClient: null, zoomClients }

            return { zoomClient: availableClient, zoomClients }
        }),
    deleteZoomAccounts: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { ids } }) => {
            const zoomAccountsWithSessions = await ctx.prisma.zoomClient.findMany({
                where: {
                    id: { in: ids },
                },
                include: { zoomSessions: true }
            })
            console.log(zoomAccountsWithSessions);

            if (zoomAccountsWithSessions.some(account => account.zoomSessions.length > 0)) throw new TRPCError({
                code: "BAD_REQUEST",
                message: `please delete all sessions using this account first!
                \n${zoomAccountsWithSessions.map(account => account.name).reduce((a, b) => a + b, "")}`
            })

            const deletedZoomAccounts = await ctx.prisma.zoomClient.deleteMany({
                where: { id: { in: ids } }
            })

            return { deletedZoomAccounts }
        }),
    createAuthCode: protectedProcedure
        .input(z.object({
            name: z.string(),
        }))
        .mutation(async ({ input: { name } }) => {
            const clientId = env.NEXT_PUBLIC_ZOOM_CLIENT_ID
            const redirectUri = encodeURIComponent(env.NEXT_PUBLIC_ZOOM_REDIRECT_URI);

            const zoomAuthUrl = `https://zoom.us/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${JSON.stringify({ name })}`;

            return { zoomAuthUrl }
        }),
    createToken: protectedProcedure
        .input(z.object({
            code: z.string(),
            state: z.string(),
        }))
        .mutation(async ({ ctx, input: { code, state } }) => {
            const { name } = JSON.parse(state) as { name: string }
            const clientId = env.NEXT_PUBLIC_ZOOM_CLIENT_ID
            const clientSecret = env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET

            const input = `${clientId}:${clientSecret}`;
            const encoded = Buffer.from(input, 'utf-8').toString('base64');

            let data = QueryString.stringify({
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': env.NEXT_PUBLIC_ZOOM_REDIRECT_URI,
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://zoom.us/oauth/token',
                headers: {
                    'Authorization': `Basic ${encoded}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: data
            };

            try {
                const response = await axios.request(config);

                const zoomClient = await ctx.prisma.zoomClient.create({
                    data: {
                        name,
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token,
                        encodedIdSecret: encoded,
                    }
                })

                return { zoomClient }
            }
            catch (error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `error` })
            }
        }),
});
