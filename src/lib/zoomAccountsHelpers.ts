import { env } from "@/env.mjs";
import axios from "axios";

export async function revokeZoomAccount(token: string) {
    const clientId = env.NEXT_PUBLIC_ZOOM_CLIENT_ID
    const clientSecret = env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET

    const input = `${clientId}:${clientSecret}`;
    const encoded = Buffer.from(input, 'utf-8').toString('base64');

    const data = JSON.stringify({
        token,
    })

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://zoom.us/oauth/revoke',
        headers: {
            'Authorization': `Basic ${encoded}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data
    };

    const response = await axios.request(config);

    return response.data
}