import Spinner from "@/components/Spinner";
import { toastType, useToast } from "@/components/ui/use-toast";
import { env } from "@/env.mjs";
import { api } from "@/lib/api";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { EmbeddedClient } from "@zoom/meetingsdk/embedded";
import { useRouter } from "next/router";
import { useState } from "react";

const useZoomMeeting = () => {
    const [isJoining, setIsJoining] = useState(false)
    const [userId, setUserId] = useState(0)
    const [zoomClient, setZoomClient] = useState<typeof EmbeddedClient>()

    const router = useRouter()
    const sessionId = router.query.session_id as string

    const { toast } = useToast()
    const [loadingToast, setLoadingToast] = useState<toastType>()

    const trpcUtils = api.useContext()

    const attendSessionMutation = api.zoomGroups.attendSession.useMutation()
    const editSessionStatusMutation = api.zoomGroups.editSessionStatus.useMutation({
        onMutate: () => setLoadingToast(toast({
            title: "Loading...",
            duration: 3000,
            description: <Spinner className="w-4 h-4" />,
            variant: "info",
        })),
        onSuccess: ({ updatedSession }) => trpcUtils.zoomGroups.invalidate()
            .then(() => {
                loadingToast?.update({
                    id: loadingToast.id,
                    title: "Success",
                    description: `Session ${updatedSession.materialItem?.title} status updated to ${updatedSession.sessionStatus}`,
                    variant: "success",
                })
                updatedSession.zoomGroup?.students.forEach(student => {
                    if (updatedSession.sessionStatus === "ongoing") sendWhatsAppMessage({
                        toNumber: `2${student.phone}` || "201123862218",
                        textBody: `Hi ${student.name}, your session for today has started, Please join from here: ${updatedSession.sessionLink}`,
                    })
                    if (updatedSession.sessionStatus === "completed") sendWhatsAppMessage({
                        toNumber: `2${student.phone}` || "201123862218",
                        textBody: `Hi ${student.name}, your session for today has been completed, don't forget to submit your assignment here: ${env.NEXT_PUBLIC_NEXTAUTH_URL}/my_courses/${updatedSession.zoomGroup?.course?.slug}/${updatedSession.zoomGroup?.courseLevel?.slug}/assignment/${updatedSession.materialItem?.slug}
                        \nYou can also view the course materials here: ${env.NEXT_PUBLIC_NEXTAUTH_URL}/my_courses/${updatedSession.zoomGroup?.course?.slug}/${updatedSession.zoomGroup?.courseLevel?.slug}/session/${updatedSession.materialItemId}`,
                    })
                })
            }),
        onError: ({ message }) => loadingToast?.update({
            id: loadingToast.id,
            title: "Error",
            description: message,
            variant: "destructive",
        }),
        onSettled: () => setLoadingToast(undefined)
    })

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
                client.join({
                    meetingNumber: meetingConfig.mn,
                    userName: meetingConfig.name,
                    signature: meetingConfig.signature,
                    sdkKey: sdkKey,
                    userEmail: meetingConfig.email,
                    password: meetingConfig.pwd,
                }).then(res => {
                    const id = client.getCurrentUser()?.userId || 0
                    setUserId(id);
                    setIsJoining(false);
                    attendSessionMutation.mutate({ sessionId })
                    editSessionStatusMutation.mutate({ id: sessionId, sessionStatus: "ongoing" })
                    client.mute(false, id)
                    client.on("connection-change", (payload) => {
                        if (payload.state === 'Closed') {
                            setUserId(0)
                            editSessionStatusMutation.mutate({ id: sessionId, sessionStatus: "completed" })
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
