import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { KJUR } from "jsrsasign";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import axios from "axios";
import QueryString from "qs";
import { format } from "date-fns";
import { env } from "@/env.mjs";
import { createZoomMeeting, refreshZoomAccountToken } from "@/lib/meetingsHelpers";
import { createMeeting, generateToken, getMeetingDetails } from "@/lib/onMeetingApi";

export const zoomMeetingsRouter = createTRPCRouter({
    generateSDKSignature: protectedProcedure
        .input(z.object({
            meetingConfig: z.object({
                mn: z.string(),
                name: z.string(),
                pwd: z.string(),
                role: z.number(),
                email: z.string(),
                lang: z.string(),
                signature: z.string(),
                china: z.number(),
            })
        })
        )
        .mutation(async ({ ctx, input: { meetingConfig } }) => {
            const sdkKey = env.ZOOM_CLIENT_ID
            const sdkSecret = env.ZOOM_CLIENT_SECRET
            let signature = ""

            const id = ctx.session.user.id
            const user = await ctx.prisma.user.findUnique({ where: { id } })
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Please login to continue!" })

            const role = user.userRoles.includes("Student") ? 0 : 1
            meetingConfig.name = user.name
            meetingConfig.email = user.email
            meetingConfig.role = role

            const iat = Math.round(new Date().getTime() / 1000) - 30;
            const exp = iat + 60 * 60 * 2;

            const oHeader = { alg: 'HS256', typ: 'JWT' };
            const oPayload = {
                sdkKey,
                iat,
                exp,
                mn: meetingConfig.mn,
                role,
            };

            const sHeader = JSON.stringify(oHeader);
            const sPayload = JSON.stringify(oPayload);
            signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret);
            meetingConfig.signature = signature

            return { sdkKey, meetingConfig }
        }),
    refreshToken: protectedProcedure
        .input(z.object({
            zoomClientId: z.string(),
        }))
        .mutation(async ({ ctx, input: { zoomClientId } }) => {
            const zoomClient = await ctx.prisma.zoomClient.findUnique({
                where: { id: zoomClientId }
            })
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "unable to find zoom client" })

            let data = QueryString.stringify({
                'grant_type': 'refresh_token',
                'refresh_token': zoomClient.refreshToken
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://zoom.us/oauth/token',
                headers: {
                    'Authorization': `Basic ${zoomClient.encodedIdSecret}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: data
            };

            const response = await axios.request(config);

            if (!response.data) throw new TRPCError({ code: "BAD_REQUEST", message: response.data })

            const updatedZoomClient = await ctx.prisma.zoomClient.update({
                where: {
                    id: zoomClientId,
                },
                data: {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                }
            })
            return { updatedZoomClient }
        }),
    createMeeting: protectedProcedure
        .input(z.object({
            topic: z.string(),
            startDate: z.date(),
            zoomClientId: z.string(),
        }))
        .mutation(async ({ ctx, input: { startDate, zoomClientId, topic } }) => {
            try {
                const zoomClient = await ctx.prisma.zoomClient.findUnique({ where: { id: zoomClientId } })
                if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "Zoom Client not found!" })

                async function getMeetingData(isZoom: boolean) {
                    if (isZoom) {
                        const updatedZoomClient = await refreshZoomAccountToken(zoomClient!, ctx.prisma)
                        const { meetingNumber, meetingPassword } = await createZoomMeeting({
                            topic,
                            agenda: topic,
                            duration: parseInt(env.NEXT_PUBLIC_PLACEMENT_TEST_TIME),
                            password: "abcd1234",
                            settings: {
                                auto_recording: "cloud",
                                host_video: true,
                                jbh_time: 10,
                                join_before_host: true,
                                waiting_room: false,
                            },
                            start_time: format(startDate, "yyyy-MM-dd'T'HH:mm:ss:SSS'Z'"),
                            timezone: "Africa/Cairo",
                            type: 2,
                        }, updatedZoomClient?.accessToken!)

                        return { meetingNumber, meetingPassword }
                    } else {
                        const token = await generateToken({ api_key: zoomClient?.accessToken!, api_secret: zoomClient?.refreshToken! })

                        const { meeting_no } = await createMeeting({
                            token,
                            meetingData: {
                                alert: true,
                                join_before_host: true,
                                recording: true,
                                room_code: zoomClient?.roomCode!,
                                topic,
                            }
                        })

                        return { meetingNumber: meeting_no, meetingPassword: "" }
                    }
                }

                const { meetingNumber, meetingPassword } = await getMeetingData(zoomClient.isZoom)

                return { meetingNumber, meetingPassword }
            } catch (error) {
                throw new TRPCError(getTRPCErrorFromUnknown(error))
            }
        }),
    getOnMeetingData: protectedProcedure
        .input(z.object({
            sessionId: z.string(),
            meetingNo: z.string(),
        }))
        .query(async ({ ctx, input: { sessionId, meetingNo } }) => {
            try {
                const session = await ctx.prisma.zoomSession.findUnique({ where: { id: sessionId }, include: { zoomClient: true } })
                if (!session?.zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "No session found!" })
                const { accessToken, refreshToken } = session.zoomClient
                const token = await generateToken({ api_key: accessToken, api_secret: refreshToken })
                const { meetingNumber, password } = await getMeetingDetails({ token, meetingNo })
                return { meetingNumber, password }
            } catch (error) {
                throw new TRPCError(getTRPCErrorFromUnknown(error))
            }
        }),
});
