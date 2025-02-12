import { env } from "@/env.mjs";
import axios from "axios";
import QueryString from "qs";

export async function revokeZoomAccount(token: string) {
    const clientId = env.NEXT_PUBLIC_ZOOM_CLIENT_ID
    const clientSecret = env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET

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