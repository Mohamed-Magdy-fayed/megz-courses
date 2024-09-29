import { unknown, z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env.mjs";
import axios, { AxiosError } from "axios";
import QueryString from "qs";
import { format } from "date-fns";
import { ZoomClient } from "@prisma/client";

export type Meeting = {
    uuid: string;
    id: number;
    host_id: string;
    topic: string;
    type: number;
    start_time: string;
    duration: number;
    timezone: string;
    agenda: string;
    created_at: string;
    join_url: string;
}

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
            const endDate = new Date(startDate)
            endDate.setHours(startDate.getHours() + 2)

            let mtngss: { client: ZoomClient, mtngs: Meeting[] }[] = []

            const availableClients = await Promise.all(zoomClients.map(async (client) => {
                try {
                    let data = QueryString.stringify({
                        'grant_type': 'refresh_token',
                        'refresh_token': client.refreshToken
                    });
                    let refreshConfig = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://zoom.us/oauth/token',
                        headers: {
                            'Authorization': `Basic ${client.encodedIdSecret}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        data: data
                    };
                    const refreshResponse = await axios.request(refreshConfig);

                    await ctx.prisma.zoomClient.update({
                        where: {
                            id: client.id,
                        },
                        data: {
                            accessToken: refreshResponse.data.access_token,
                            refreshToken: refreshResponse.data.refresh_token,
                        }
                    })

                    const config = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        url: `https://api.zoom.us/v2/users/me/meetings?type=upcoming${!startDate ? "" : `&from=${format(startDate, "yyyy-MM-dd")}`}${!endDate ? "" : `&to=${format(endDate, "yyyy-MM-dd")}`}&timezone=Africa%2FCairo`,
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${refreshResponse.data.access_token}`,
                        },
                    };

                    const response = (await axios.request(config)).data;
                    const mtngs = response.meetings as Meeting[]
                    mtngss.push({ client, mtngs })

                    const isOverlapping = mtngs.some(m => {
                        const existingStart = new Date(m.start_time);
                        const existingEnd = new Date(existingStart);
                        existingEnd.setMinutes(existingEnd.getMinutes() + m.duration);

                        const newMeetingEnd = new Date(startDate);
                        newMeetingEnd.setHours(newMeetingEnd.getHours() + 2);

                        return (startDate < existingEnd && newMeetingEnd > existingStart);
                    });

                    return isOverlapping ? null : client;
                } catch (error: any) {
                    return null
                }
            }));

            const filteredClients = availableClients.filter(client => client !== null);
            if (filteredClients.length === 0) return { zoomClient: null, zoomClients }

            return { zoomClient: filteredClients[0], zoomClients, mtngss }
        }),
    checkMeetings: protectedProcedure
        .input(z.object({
            id: z.string(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
        }))
        .mutation(async ({ ctx, input: { id, startDate, endDate } }) => {
            const zoomClient = await ctx.prisma.zoomClient.findUnique({ where: { id } })
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No Zoom Account with this ID" })

            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `https://api.zoom.us/v2/users/me/meetings?type=scheduled${!startDate ? "" : `&from=${format(startDate, "yyyy-MM-dd")}`}${!endDate ? "" : `&to=${format(endDate, "yyyy-MM-dd")}`}&timezone=Africa%2FCairo`,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${zoomClient.accessToken}`,
                },
            };

            try {
                const response = (await axios.request(config)).data;
                const mtngs = response.meetings as Meeting[]

                return {
                    meetings: mtngs.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime() < 0 ? 1 : -1) as Meeting[],
                };
            } catch (error: any) {
                if (error.message.endsWith(401)) throw new TRPCError({ code: "UNAUTHORIZED", message: "account access was revoked please authorize again!" })
                if (error.message.endsWith(400)) throw new TRPCError({ code: "UNAUTHORIZED", message: "please refresh access token first!" })
                throw new TRPCError({ code: "BAD_REQUEST", message: error.message })
            }
        }),
    deleteZoomAccounts: protectedProcedure
        .input(z.object({
            ids: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input: { ids } }) => {

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
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JSON.stringify(error) })
            }
        }),
});
