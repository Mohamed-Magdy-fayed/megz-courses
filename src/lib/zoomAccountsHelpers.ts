import { env } from "@/env.mjs";
import { Meeting } from "@/lib/meetingsHelpers";
import axios from "axios";
import { format } from "date-fns";
import QueryString from "qs";

export async function revokeZoomAccount(token: string) {
    const clientId = env.ZOOM_CLIENT_ID
    const clientSecret = env.ZOOM_CLIENT_SECRET

    const data = QueryString.stringify({
        'token': token,
        'client_id': clientId,
        'client_secret': clientSecret
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://zoom.us/oauth/revoke',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data
    };

    try {
        await axios.request(config);
    } catch (error: any) {
        console.log(error.response.data);
    }
}

export async function getZoomAccountMeetings({ accessToken, endDate, startDate }: { accessToken: string; startDate?: Date; endDate?: Date; }) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.zoom.us/v2/users/me/meetings?type=Scheduled${!startDate ? "" : `&from=${format(startDate, "yyyy-MM-dd")}`}${!endDate ? "" : `&to=${format(endDate, "yyyy-MM-dd")}`}&timezone=Africa%2FCairo`,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    try {
        const response = (await axios.request(config)).data;
        const mtngs = response.meetings as Meeting[]

        return {
            meetings: mtngs.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()) as Meeting[],
        };
    } catch (error: any) {
        if (error.message.endsWith(401)) throw new Error("account access was revoked please authorize again!")
        if (error.message.endsWith(400)) throw new Error("please refresh access token first!")
        throw new Error(error.message)
    }
}

export const getZakToken = async (userId: string, token: string) => {
    const response = await axios.get(
        `https://api.zoom.us/v2/users/${userId}/token?type=zak`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data.token;
};
