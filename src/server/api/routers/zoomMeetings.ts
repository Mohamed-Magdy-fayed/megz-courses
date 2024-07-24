import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc";
import { KJUR } from "jsrsasign";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import QueryString from "qs";
import { MeetingResponse, ZoomMeeting } from "@/lib/zoomTypes";
import { format } from "date-fns";
import { generateGroupNumnber, getZoomSessionDays } from "@/lib/utils";

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
            const sdkKey = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID
            const sdkSecret = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET
            let signature = ""

            const id = ctx.session.user.id
            const user = await ctx.prisma.user.findUnique({ where: { id } })
            if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Please login to continue!" })

            const role = user.userType === "student" ? 0 : 1
            meetingConfig.name = user.name
            meetingConfig.email = user.email
            meetingConfig.role = role

            const iat = Math.round(new Date().getTime() / 1000) - 30;
            const exp = iat + 60 * 60 * 2;

            // Header
            const oHeader = { alg: 'HS256', typ: 'JWT' };
            // Payload
            const oPayload = {
                sdkKey,
                iat,
                exp,
                mn: meetingConfig.mn,
                role,
            };
            // Sign JWT
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
            zoomClientId: z.string(),
            trainerId: z.string(),
            courseId: z.string(),
            startDate: z.date(),
            courseLevelId: z.string(),
        }))
        .mutation(async ({ ctx, input: { startDate, courseLevelId, zoomClientId, courseId, trainerId } }) => {
            const trainer = await ctx.prisma.trainer.findUnique({ where: { id: trainerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId }, include: { levels: { include: { materialItems: true } } } })
            if (!trainer || !course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course or trainer doesn't exist!" })

            const level = await ctx.prisma.courseLevel.findUnique({ where: { id: courseLevelId }, include: { materialItems: true } })
            if (!level) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Level doesn't exist!" })

            const zoomClient = await ctx.prisma.zoomClient.findUnique({ where: { id: zoomClientId } })
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "no zoom account with this ID" })

            const groupNumber = generateGroupNumnber(startDate, trainer.user.name, course.name)
            const repeatDays = getZoomSessionDays(startDate.getDay())

            const meetingData: Partial<ZoomMeeting> = {
                topic: groupNumber,
                agenda: `${course.name} Course @ Level ${level.name}`,
                duration: 120,
                password: "abcd1234",
                recurrence: {
                    end_times: level.materialItems.length,
                    type: 2,
                    repeat_interval: 1,
                    weekly_days: repeatDays.join(","),
                },
                settings: {
                    auto_recording: "cloud",
                    host_video: true,
                    jbh_time: 10,
                    join_before_host: true,
                    waiting_room: false,
                },
                start_time: format(startDate, "yyyy-MM-dd'T'HH:mm:ss:SSS'Z'"),
                timezone: "Africa/Cairo",
                type: 8,
            }

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.zoom.us/v2/users/me/meetings',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${zoomClient.accessToken}`,
                },
                data: JSON.stringify(meetingData)
            };

            const response = await axios.request(config);

            const meetingResponse: MeetingResponse = response.data
            if (!meetingResponse.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "failed to create meeting!" })
            const meetingNumber = meetingResponse.id.toString()
            const meetingPassword = meetingResponse.password
            const meetingLink = meetingResponse.join_url


            return { meetingResponse, meetingNumber, meetingPassword, meetingLink, groupNumber }
        }),
    createPlacementTestMeeting: protectedProcedure
        .input(z.object({
            zoomClientId: z.string(),
            trainerId: z.string(),
            courseId: z.string(),
            testTime: z.date(),
        }))
        .mutation(async ({ ctx, input: { testTime, zoomClientId, trainerId, courseId } }) => {
            const trainer = await ctx.prisma.trainer.findUnique({ where: { id: trainerId }, include: { user: true } })
            const course = await ctx.prisma.course.findUnique({ where: { id: courseId } })
            if (!trainer || !course) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Course or trainer doesn't exist!" })

            const zoomClient = await ctx.prisma.zoomClient.findUnique({ where: { id: zoomClientId } })
            if (!zoomClient) throw new TRPCError({ code: "BAD_REQUEST", message: "no zoom account with this ID" })

            const meetingData: Partial<ZoomMeeting> = {
                topic: `Placement Test for course ${course.name}`,
                agenda: `Oral test with mr. ${trainer.user.name}`,
                duration: 120,
                password: "abcd1234",
                settings: {
                    auto_recording: "cloud",
                    host_video: true,
                    jbh_time: 10,
                    join_before_host: true,
                    waiting_room: false,
                },
                start_time: format(testTime, "yyyy-MM-dd'T'HH:mm:ss:SSS'Z'"),
                timezone: "Africa/Cairo",
                type: 2,
            }

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.zoom.us/v2/users/me/meetings',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${zoomClient.accessToken}`,
                },
                data: JSON.stringify(meetingData)
            };

            const response = await axios.request(config);

            const meetingResponse: MeetingResponse = response.data
            if (!meetingResponse.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "failed to create meeting!" })
            const meetingNumber = meetingResponse.id.toString()
            const meetingPassword = meetingResponse.password
            const meetingLink = meetingResponse.join_url

            const updatedZoomClient = await ctx.prisma.zoomClient.update({
                where: { id: zoomClientId },
                data: {
                    zoomSessions: {
                        create: {
                            sessionDate: testTime,
                            sessionLink: meetingLink,
                            sessionStatus: "scheduled",
                        }
                    }
                }
            })

            return { meetingResponse, meetingNumber, meetingPassword, meetingLink, updatedZoomClient }
        }),
});
