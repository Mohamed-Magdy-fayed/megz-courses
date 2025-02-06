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

    const res = await axios(config)

    if (res.data.status) {
        return res.data.results.data
    } else {
        throw new Error(res.data.errorMessage)
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

    const res = await axios(config)

    if (res.data.status) {
        return res.data.results.data.token
    } else {
        throw new Error(res.data.errorMessage)
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

    const res = await axios(config)

    if (res.data.status) {
        return res.data.results.data as Room[]
    } else {
        throw new Error(res.data.errorMessage)
    }
}

export async function getUserRoom({ token }: { token: string }) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${onMeetingApiBaseUrl}/user/rooms`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
    };

    const res = await axios(config)

    if (res.data.status) {
        return res.data.results.data[0] as {
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
        }
    } else {
        throw new Error(res.data.errorMessage)
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

    const res = await axios(config)

    if (res.data.status) {
        return axios({ method: "get", url: res.data.results.data.join_url }).then(res => {
            const meetingNumberStart = res.data.split("zoom.us/j/")[1]
            const match = meetingNumberStart.match(/^(\d+)\?pwd=([^">]+)/);

            const meetingNumber = match[1];
            const password = match[2];

            return { meetingNumber, password } as { meetingNumber: string; password: string; }
        }).catch(e => {
            console.log(e)
            return { meetingNumber: null, password: null } as { meetingNumber: null; password: null; }
        })
    } else {
        console.log(res.data.errorMessage)
        throw new Error(res.data.errorMessage)
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

    const res = await axios(config)

    if (res.data.status) {
        return res.data.results.data as {
            id: string;
            meeting_no: string;
            topic: string;
            room_code: string
            join_before_host: boolean;
            alert: boolean;
            recording: boolean;
        }
    } else {
        throw new Error(res.data.errorMessage)
    }
}
