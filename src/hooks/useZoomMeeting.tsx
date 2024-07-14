import { api } from "@/lib/api";
import { EmbeddedClient } from "@zoom/meetingsdk/embedded";
import { useRouter } from "next/router";
import { useState } from "react";

const useZoomMeeting = () => {
    const [isJoining, setIsJoining] = useState(false)
    const [userId, setUserId] = useState(0)
    const [zoomClient, setZoomClient] = useState<typeof EmbeddedClient>()

    const router = useRouter()
    const sessionId = router.query.session_id as string

    const attendSessionMutation = api.zoomGroups.attendSession.useMutation()

    const createClient = (meetingConfig: {
        name: string;
        signature: string;
        email: string;
        pwd: string;
        mn: string;
        role: number;
        lang: string;
        china: number;
    }, sdkKey: string) => {
        import("@zoom/meetingsdk/embedded").then((ZoomMtgEmbedded) => {

            const client = ZoomMtgEmbedded.default.createClient();
            const root = document.getElementById("root") as HTMLElement
            const activeApps = document.getElementById("activeApps") as HTMLElement

            setIsJoining(true)

            client.init({
                zoomAppRoot: root,
                customize: {
                    activeApps: { popper: { anchorElement: activeApps, disableDraggable: true, placement: "bottom-end" } },
                    chat: { popper: { anchorElement: activeApps, disableDraggable: true, placement: "bottom-end" } },
                    meeting: { popper: { anchorElement: activeApps, disableDraggable: true, placement: "bottom-end" } },
                    participants: { popper: { anchorElement: activeApps, disableDraggable: true, placement: "bottom-end" } },
                    setting: { popper: { anchorElement: activeApps, disableDraggable: true, placement: "bottom-end" } },
                    video: {
                        isResizable: false, popper: { disableDraggable: true }, viewSizes: {
                            default: { width: 800, height: 10 },
                            ribbon: { width: 800, height: 10 }
                        }
                    }
                },
                leaveOnPageUnload: true,
            }).then((res) => {
                console.log(res);
                client.join({
                    meetingNumber: meetingConfig.mn,
                    userName: meetingConfig.name,
                    signature: meetingConfig.signature,
                    sdkKey: sdkKey,
                    userEmail: meetingConfig.email,
                    password: meetingConfig.pwd,
                }).then(res => {
                    console.log(res);
                    const id = client.getCurrentUser()?.userId || 0
                    setUserId(id);
                    setIsJoining(false);
                    attendSessionMutation.mutate({ sessionId })
                    client.mute(false, id)
                    client.on("connection-change", (payload) => {
                        if (payload.state === 'Closed') {
                            setUserId(0)
                        }
                    })
                    setZoomClient(client)
                })
            })
                .catch(() => setIsJoining(false))
        })
    }

    return {
        createClient,
        isJoining,
        userId,
        zoomClient,
    };
};

export default useZoomMeeting;
