import { env } from "@/env.mjs";
import { generateToken, getUserMeetings } from "@/lib/onMeetingApi";
import { getZoomSessionDays } from "@/lib/utils";
import { MeetingResponse, ZoomMeeting } from "@/lib/zoomTypes";
import { PrismaClient, ZoomClient } from "@prisma/client";
import { getTRPCErrorFromUnknown, TRPCError } from "@trpc/server";
import axios from "axios";
import { format } from "date-fns";
import QueryString from "qs";

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

export async function refreshZoomAccountToken(client: ZoomClient, prisma: PrismaClient) {
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

        const refreshResponse = await axios.request(refreshConfig)

        const refreshedClient = await prisma.zoomClient.update({
            where: {
                id: client.id,
            },
            data: {
                accessToken: refreshResponse.data.access_token,
                refreshToken: refreshResponse.data.refresh_token,
            }
        })

        return refreshedClient
    } catch (error: any) {
        console.log(error.response?.data);
        throw new Error(JSON.stringify(error.response?.data))
    }
}

export async function getZoomAccountMeetings(client: ZoomClient, startDate?: Date, endDate?: Date) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.zoom.us/v2/users/me/meetings?type=upcoming${!startDate ? "" : `&from=${format(startDate, "yyyy-MM-dd")}`}${!endDate ? "" : `&to=${format(endDate, "yyyy-MM-dd")}`}&timezone=Africa%2FCairo`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${client.accessToken}`,
        },
    };

    const response = (await axios.request(config)).data;
    return response.meetings as Meeting[]
}
export async function getAvailableZoomClient(
    startDate: Date,
    prisma: PrismaClient,
    meetingDurationInMinutes = 120
) {
    const zoomClients = await prisma.zoomClient.findMany({
        include: { zoomSessions: true },
        orderBy: { id: "desc" },
    });

    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + meetingDurationInMinutes)

    const availableClients = zoomClients.filter(client => {
        try {
            const hasOverlap = client.zoomSessions.some(session => {
                const existingStart = new Date(session.sessionDate);
                const existingEnd = new Date(existingStart);
                existingEnd.setMinutes(existingStart.getMinutes() + meetingDurationInMinutes);

                return (startDate >= existingStart && startDate < existingEnd) ||
                    (endDate > existingStart && endDate < existingEnd) ||
                    (startDate <= existingStart && endDate >= existingEnd)
            });

            return !hasOverlap;
        } catch (error) {
            return false;
        }
    });

    if (availableClients.length === 0) return { zoomClient: null };

    return { zoomClient: availableClients[0] };
}

export async function createZoomMeeting(meetingData: Partial<ZoomMeeting>, accessToken: string) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.zoom.us/v2/users/me/meetings',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            data: JSON.stringify(meetingData)
        };

        const response = await axios.request(config);
        if (!response.data.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "failed to create meeting!" })
        const meetingNumber = response.data.id.toString() as string
        const meetingPassword = response.data.password as string
        const meetingLink = response.data.join_url as string

        return {
            meetingNumber,
            meetingPassword,
            meetingLink,
        }
    } catch (error) {
        throw getTRPCErrorFromUnknown(error)
    }
}

export function generateGroupMeetingConfig({
    courseName,
    groupNumber,
    levelName,
    materialItemsCount,
    startDate,
    sessionDates,
}: {
    groupNumber: string; courseName: string; levelName: string; materialItemsCount: number;
    startDate: Date;
    sessionDates: {
        date: Date;
        sessionId?: string;
    }[];
}) {
    return {
        topic: groupNumber,
        agenda: `${courseName} Course @ Level ${levelName}`,
        duration: 120,
        password: "abcd1234",
        recurrence: {
            end_times: materialItemsCount,
            type: 2,
            repeat_interval: 1,
            weekly_days: sessionDates.map(s => s.date.getDate()).join(","),
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
}

export async function deleteZoomMeeting(meetingId: string, accessToken: string) {
    try {
        const config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `https://api.zoom.us/v2/meetings/${meetingId}`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        };

        const response = await axios.request(config);

        return response.data as MeetingResponse
    } catch (error) {
        console.log(error);

        throw getTRPCErrorFromUnknown(error)
    }
}

export function meetingLinkConstructor({ meetingNumber, meetingPassword, sessionTitle, leaveUrl, sessionId }: {
    meetingNumber: string,
    meetingPassword: string,
    sessionTitle: string,
    sessionId?: string,
    leaveUrl?: string,
}) {
    return `meeting/?mn=${meetingNumber}&pwd=${meetingPassword}&session_title=${sessionTitle}${sessionId ? `&session_id=${sessionId}` : ""}${leaveUrl ? `&leave_url=${leaveUrl}` : ""}`
}

export function preMeetingLinkConstructor({ isZoom, zakToken, meetingNumber, meetingPassword, sessionTitle, leaveUrl, sessionId }: {
    isZoom: boolean,
    meetingNumber: string,
    meetingPassword: string,
    sessionTitle: string,
    zakToken?: string,
    sessionId?: string,
    leaveUrl?: string,
}) {
    return `${isZoom ? "meeting" : "onmeeting"}/?mn=${meetingNumber}&pwd=${meetingPassword}&session_title=${sessionTitle}${sessionId ? `&session_id=${sessionId}` : ""}${leaveUrl ? `&leave_url=${leaveUrl}` : ""}${zakToken ? `&zak=${zakToken}` : ""}`
}
