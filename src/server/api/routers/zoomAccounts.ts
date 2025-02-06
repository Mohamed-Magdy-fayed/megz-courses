import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env.mjs";
import axios from "axios";
import QueryString from "qs";
import { format } from "date-fns";
import { getAvailableZoomClient, Meeting } from "@/lib/meetingsHelpers";
import { generateKeys, generateToken, getUserMeetings } from "@/lib/onMeetingApi";
import { revokeZoomAccount } from "@/lib/zoomAccountsHelpers";

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
            const { zoomClient } = await getAvailableZoomClient(startDate, ctx.prisma)
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No available Zoom Accounts at the selected time!" })

            return { zoomClient }
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

            if (!zoomClient.isZoom) {
                const token = await generateToken({ api_key: zoomClient.accessToken, api_secret: zoomClient.refreshToken })
                const rooms = await getUserMeetings({ token })

                const meetings: Meeting[] = rooms.flatMap(r => r.meetings).map(meeting => ({
                    agenda: "",
                    created_at: "",
                    duration: 120,
                    host_id: "",
                    id: 123,
                    join_url: `https://onmeeting.co/j/${meeting.meeting_no}`,
                    start_time: meeting.start?.toDateString() || new Date()?.toDateString(),
                    timezone: "",
                    topic: meeting.topic,
                    type: meeting.type,
                    uuid: ""
                }))

                return {
                    meetings: meetings.sort((a, b) => new Date(a.start_time || new Date()).getTime() - new Date(b.start_time || new Date()).getTime() < 0 ? 1 : -1),
                };
            }

            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `https://api.zoom.us/v2/users/me/meetings?type=Scheduled${!startDate ? "" : `&from=${format(startDate, "yyyy-MM-dd")}`}${!endDate ? "" : `&to=${format(endDate, "yyyy-MM-dd")}`}&timezone=Africa%2FCairo`,
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
            const clients = await ctx.prisma.zoomClient.findMany({ where: { id: { in: ids } } })

            await Promise.all(clients.map(async (client) => {
                await revokeZoomAccount(client.accessToken)
            }))

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
    createOnMeetingKeys: protectedProcedure
        .input(z.object({
            name: z.string(),
            email: z.string(),
            password: z.string(),
        }))
        .mutation(async ({ ctx, input: { name, email, password } }) => {
            const data = await generateKeys({ email, password })

            const zoomClient = await ctx.prisma.zoomClient.create({
                data: {
                    name,
                    accessToken: data.api_key,
                    refreshToken: data.api_secret,
                    encodedIdSecret: data.account_id,
                    isZoom: false,
                }
            })

            return { zoomClient }
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
                        isZoom: true,
                    }
                })

                return { zoomClient }
            }
            catch (error) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: JSON.stringify(error) })
            }
        }),
    refreshOnMeetingToken: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input: { id } }) => {
            const client = await ctx.prisma.zoomClient.findUnique({ where: { id } })
            if (!client) throw new TRPCError({ code: "BAD_REQUEST", message: "No Zoom client found!" })

            const token = await generateToken({ api_key: client.accessToken, api_secret: client.refreshToken })

            return { token }
        }),
});
