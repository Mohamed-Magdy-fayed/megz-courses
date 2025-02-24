import Spinner from '@/components/Spinner';
import { api } from '@/lib/api';
import { preMeetingLinkConstructor } from '@/lib/meetingsHelpers';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function OnMeetingPage({ meetingNo, sessionId, sessionTitle }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()

    const { data: meetingData, error } = api.zoomMeetings.getOnMeetingData.useQuery({ meetingNo, sessionId }, {
        retry(failureCount) {
            return failureCount > 2
        },
    })

    useEffect(() => {
        if (meetingData && meetingData.meetingNumber.length) {
            const sessionUrl = preMeetingLinkConstructor({
                isZoom: true,
                sessionTitle,
                sessionId,
                meetingNumber: meetingData.meetingNumber,
                meetingPassword: meetingData.password,
            })
            router.push(`/${sessionUrl}`)
        }
    }, [meetingData])

    if (error) return (
        <div className="grid place-content-center min-h-screen p-12">
            {error.message}
        </div>
    )

    return (
        <div className="grid place-content-center min-h-screen p-12">
            <Spinner />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<{
    meetingNo: string;
    sessionTitle: string;
    sessionId: string;
}> = async (ctx) => {
    const { mn, session_title, session_id } = ctx.query

    if (typeof mn !== "string" || typeof session_title !== "string" || typeof session_id !== "string") throw new Error("incorrect input!")

    return {
        props: {
            meetingNo: mn,
            sessionTitle: session_title,
            sessionId: session_id,
        }
    }
}

export default OnMeetingPage