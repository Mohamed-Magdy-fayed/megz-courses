import { Meeting } from "@/lib/meetingsHelpers";
import axios from "axios"

const onMeetingApiBaseUrl = "https://onmeeting.co/v2"

export type Room = {
    room_id: string;
    room_name: string;
    meetings: OnMeeting[];
}

export type OnMeeting = {
    meeting_id: string;
    meeting_no: string;
    topic: string;
    type: number; // (1 for no time meeting , 2 for meeting with time)
    date: Date | null;
    start: Date | null;
    end: Date | null;
    status: number // (0 not-started , 2 waiting , 1 running)
}

export async function generateKeys({ email, password }: { email: string; password: string; }) {
    let data = JSON.stringify({
        email,
        password
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/user/api-keys`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const res = await axios(config)
        return res.data.results.data
    } catch (error: any) {
        console.log(error.response.data);
        throw new Error(error.response.data.errorMessage)
    }
}

export async function generateToken({ api_key, api_secret }: { api_key: string; api_secret: string; }) {
    let data = JSON.stringify({
        api_key,
        api_secret
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/auth/token`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const res = await axios(config)
        return res.data.results.data.token
    } catch (error: any) {
        console.log(error.response.data);
        throw new Error(error.response.data.errorMessage)
    }
}

export async function getUserMeetings({ token }: { token: string }) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/user/meetings`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
    };

    try {
        const res = await axios(config)
        return res.data.results.data as Room[]
    } catch (error: any) {
        console.log(error.response.data);
        throw new Error(error.response.data.errorMessage)
    }
}

export async function getUserRooms({ token }: { token: string }) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/user/rooms`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
    };

    try {
        const res = await axios(config)
        return res.data.results.data as {
            account_id: string;
            room_code: string;
            room_name: string;
            room_capicity: number;
            active: number; // 1 || 0
            type: "y" | "d" | "m"; // (d for daily plan, m for monthly plan, y for yearly plan
            trial: number; // 1 || 0
            period_quantity: number;
            subscription_end_date: Date;
            occurance: number;
            status: number; // (0 not - started, 2 waiting, 1 running)
        }[]
    } catch (error: any) {
        console.log(error.response.data);
        throw new Error(error.response.data.errorMessage)
    }
}

export async function getMeetingDetails({ token, meetingNo }: { token: string; meetingNo: string; }) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/meeting/${meetingNo}`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
    };

    try {
        const res = await axios(config)
        const zakToken = res.data.results.data.start_url.split("zak=")[1];

        return await axios({ method: "get", url: res.data.results.data.join_url }).then(res => {
            const meetingNumberStart = res.data.split("zoom.us/j/")[1]
            if (!meetingNumberStart) throw new Error("Another meeting may be ongoing now on this zoom room!")
            const match = meetingNumberStart.match(/^(\d+)\?pwd=([^">]+)/);

            const meetingNumber = match[1];
            const password = match[2];

            return { meetingNumber, password, zakToken } as { meetingNumber: string; password: string; zakToken: string; }
        })
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function createMeeting({ meetingData, token }: {
    token: string;
    meetingData: {
        topic: string;
        room_code: string;
        join_before_host: boolean;
        recording: boolean;
        alert: boolean;
    }
}) {
    const data = JSON.stringify(meetingData);

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/meeting`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const res = await axios(config)
        return res.data.results.data as {
            id: string;
            meeting_no: string;
            topic: string;
            room_code: string
            join_before_host: boolean;
            alert: boolean;
            recording: boolean;
        }
    } catch (error: any) {
        console.log(error.response.data);
        throw new Error(error.response.data.errorMessage)
    }
}

export async function getMeetings({ api_key, api_secret, endDate, startDate }: { api_key: string; api_secret: string; startDate?: Date; endDate?: Date; }) {
    const token = await generateToken({ api_key, api_secret })
    const rooms = await getUserMeetings({ token })

    const meetings: Meeting[] = rooms
        .flatMap(r => r.meetings)
        .filter(m => !!m.date &&
            (!startDate || new Date(m.date) > new Date(startDate)) &&
            (!endDate || new Date(m.date) <= new Date(endDate))
        )
        .map(meeting => {

            return ({
                agenda: meeting.topic,
                created_at: meeting.date ? new Date(meeting.date).toISOString() : "",
                duration: (meeting.end && meeting.start) ? (new Date(meeting.end).getTime() - new Date(meeting.start).getTime()) / (1000 * 60) : 0,
                host_id: "",
                id: Number(meeting.meeting_no),
                join_url: `https://onmeeting.co/j/${meeting.meeting_no}`,
                start_time: meeting.start ? new Date(meeting.start).toISOString() : "",
                timezone: "",
                topic: meeting.topic,
                type: meeting.type,
                uuid: meeting.meeting_id
            })
        }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return {
        rooms,
        meetings,
    };
}
