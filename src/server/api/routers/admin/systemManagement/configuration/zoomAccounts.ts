import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import { env } from "@/env.mjs";
import axios from "axios";
import QueryString from "qs";
import { getAvailableZoomClient, getZoomAccountMeetings } from "@/lib/meetingsHelpers";
import { generateKeys, generateToken, getMeetings, getUserRooms } from "@/lib/onMeetingApi";
import { revokeZoomAccount } from "@/lib/zoomAccountsHelpers";
import { SessionColumn } from "@/components/admin/systemManagement/config/zoomAccount/zoomAccountMeetings/ZoomAccountMeetingsColumn";

export const zoomAccountsRouter = createTRPCRouter({
    getZoomAccount: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ ctx, input: { id } }) => {
            const zoomClient = await ctx.prisma.zoomClient.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    isZoom: true,
                    createdAt: true,
                    updatedAt: true,
                    zoomSessions: {
                        select: {
                            id: true,
                            sessionStatus: true,
                            meetingNumber: true,
                            meetingPassword: true,
                            sessionDate: true,
                            materialItem: { select: { title: true } },
                            teacher: {
                                select: { user: { select: { name: true, id: true } } }
                            },
                            zoomGroup: { select: { id: true, groupNumber: true } },
                            placementTest: { select: { id: true, course: true, student: { select: { name: true } }, tester: { select: { user: { select: { name: true, id: true } } } } } }
                        }
                    },
                }
            })
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No Zoom Account with this ID" })

            const sessions: SessionColumn[] = zoomClient.zoomSessions.map(s => ({
                id: s.id,
                sessionTitle: s.materialItem?.title || `${s.placementTest?.student.name}'s placement test with ${s.placementTest?.tester.user.name}`,
                sessionDate: s.sessionDate,
                meetingNumber: s.meetingNumber,
                meetingPassword: s.meetingPassword,
                sessionStatus: s.sessionStatus,
                trainerId: s.teacher?.user.id || s.placementTest?.tester.user.id || "No Trainer",
                trainerName: s.teacher?.user.name || s.placementTest?.tester.user.name || "No Trainer",
                groupId: s.zoomGroup?.id || s.placementTest?.id,
                groupName: s.zoomGroup?.groupNumber || `Placement Test`,
                isTest: !!s.placementTest?.student.name,
                isZoom: zoomClient.isZoom,
            }))

            return {
                zoomClient,
                sessions,
            }
        }),
    getZoomAccounts: protectedProcedure
        .query(async ({ ctx }) => {
            const zoomAccounts = await ctx.prisma.zoomClient.findMany({ include: { zoomSessions: true }, omit: { accessToken: true, refreshToken: true, encodedIdSecret: true } })
            return { zoomAccounts }
        }),
    getAccountMeetings: protectedProcedure
        .input(z.object({
            id: z.string(),
            isUpcoming: z.boolean().optional(),
        }))
        .query(async ({ ctx, input: { id, isUpcoming } }) => {
            const select = {
                id: true,
                sessionStatus: true,
                meetingNumber: true,
                meetingPassword: true,
                sessionDate: true,
                materialItem: { select: { title: true } },
                zoomClient: { omit: { accessToken: true, refreshToken: true, } },
                zoomGroup: { select: { teacher: { select: { user: { select: { id: true, name: true } } } }, id: true, groupNumber: true } },
                placementTest: { select: { id: true, course: true, student: { select: { name: true } }, tester: { select: { user: { select: { name: true, id: true } } } } } }
            }

            if (isUpcoming) {
                const zoomSessions = await ctx.prisma.zoomSession.findMany({
                    where: { zoomClientId: id, sessionDate: { gte: new Date() } },
                    select,
                })
                return { zoomSessions }
            }
            const zoomSessions = await ctx.prisma.zoomSession.findMany({ where: { zoomClientId: id }, select })
            return { zoomSessions }
        }),
    getAvailableZoomClient: protectedProcedure
        .input(z.object({
            startDate: z.date(),
            isTest: z.boolean(),
        }))
        .mutation(async ({ ctx, input: { startDate, isTest } }) => {
            const { zoomClient } = await getAvailableZoomClient(startDate, ctx.prisma, isTest ? parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME) : 120)
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
                return await getMeetings({ api_key: zoomClient.accessToken, api_secret: zoomClient.refreshToken, startDate, endDate })
            }

            return await getZoomAccountMeetings(zoomClient, startDate, endDate)
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
            const clientId = env.ZOOM_CLIENT_ID
            const redirectUri = encodeURIComponent(env.ZOOM_REDIRECT_URI);

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
            try {
                const data = await generateKeys({ email, password })
                const token = await generateToken({ api_key: data.api_key, api_secret: data.api_secret })
                const rooms = await getUserRooms({ token })

                const zoomClients = await ctx.prisma.$transaction(rooms.map(room => ctx.prisma.zoomClient.create({
                    data: {
                        name,
                        accessToken: data.api_key,
                        refreshToken: data.api_secret,
                        encodedIdSecret: data.account_id,
                        isZoom: false,
                        roomCode: room.room_code,
                    }
                })))

                return { zoomClients }
            } catch (error) {
                throw new TRPCError(getTRPCErrorFromUnknown(error))
            }
        }),
    createToken: protectedProcedure
        .input(z.object({
            code: z.string(),
            state: z.string(),
        }))
        .mutation(async ({ ctx, input: { code, state } }) => {
            const { name } = JSON.parse(state) as { name: string }
            const clientId = env.ZOOM_CLIENT_ID
            const clientSecret = env.ZOOM_CLIENT_SECRET

            const input = `${clientId}:${clientSecret}`;
            const encoded = Buffer.from(input, 'utf-8').toString('base64');

            let data = QueryString.stringify({
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': env.ZOOM_REDIRECT_URI,
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
                throw new TRPCError(getTRPCErrorFromUnknown(error))
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
