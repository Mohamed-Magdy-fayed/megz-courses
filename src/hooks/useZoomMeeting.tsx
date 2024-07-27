import { env } from "@/env.mjs";
import { api } from "@/lib/api";
import { sendWhatsAppMessage } from "@/lib/whatsApp";
import { useState } from "react";

const useZoomMeeting = () => {
    const [isJoining, setIsJoining] = useState(false)
    const [userId, setUserId] = useState(0)
    const [userName, setUserName] = useState("")

    const trpcUtils = api.useContext()

    const attendSessionMutation = api.zoomGroups.attendSession.useMutation()
    const editSessionStatusMutation = api.zoomGroups.editSessionStatus.useMutation({
        onSuccess: ({ updatedSession }) => trpcUtils.zoomGroups.invalidate()
            .then(() => {
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
    },
        sdkKey: string,
        leaveUrl: string,
        sessionId: string
    ) => {
        setIsJoining(true)
        import('@zoomus/websdk').then(({ ZoomMtg }) => {
            ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.2/lib', '/av');
            ZoomMtg.preLoadWasm();
            ZoomMtg.prepareWebSDK();

            ZoomMtg.init({
                leaveUrl,
                defaultView: "speaker",
                success: () => {
                    ZoomMtg.join({
                        meetingNumber: meetingConfig.mn,
                        userName: meetingConfig.name,
                        signature: meetingConfig.signature,
                        sdkKey,
                        userEmail: meetingConfig.email,
                        passWord: meetingConfig.pwd,
                        success: () => {
                            ZoomMtg.getCurrentUser({
                                success: (data: any) => {
                                    setUserId(data.result.currentUser.userId);
                                    setUserName(data.result.currentUser.userName);
                                    setIsJoining(false);
                                }
                            })

                            attendSessionMutation.mutate({ sessionId })
                            editSessionStatusMutation.mutate({ id: sessionId, sessionStatus: "ongoing" })
                        },
                        error: (error: any) => {
                            console.log('Error joining meeting', error);
                        },
                    });
                },
                error: (error: any) => {
                    console.log('Error initializing Zoom SDK', error);
                },
            });
        })
    }

    return {
        createClient,
        isJoining,
        userId,
        userName,
    };
};

export default useZoomMeeting;
