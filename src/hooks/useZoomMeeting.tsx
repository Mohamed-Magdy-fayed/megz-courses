import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useState } from "react";

const useZoomMeeting = () => {
    const [isJoining, setIsJoining] = useState(false)
    const [userId, setUserId] = useState(0)
    const [userName, setUserName] = useState("")

    const session = useSession()
    const trpcUtils = api.useUtils()

    const attendSessionMutation = api.zoomGroups.attendSession.useMutation()
    const editSessionStatusMutation = api.zoomGroups.editSessionStatus.useMutation({
        onSuccess: ({ updatedSession }) => trpcUtils.zoomGroups.invalidate()
    })

    const createClient = (meetingConfig: {
        name: string;
        signature: string;
        email: string;
        pwd: string;
        mn: string;
        zak?: string;
        role: number;
        lang: string;
        china: number;
    },
        sdkKey: string,
        leaveUrl: string,
        sessionId: string
    ) => {
        setIsJoining(true)
        import('@zoom/meetingsdk').then(({ ZoomMtg }) => {
            ZoomMtg.setZoomJSLib('https://source.zoom.us/3.11.2/lib', '/av');
            ZoomMtg.preLoadWasm();
            ZoomMtg.prepareWebSDK();

            ZoomMtg.init({
                leaveUrl,
                defaultView: "speaker",
                success: () => {
                    console.log({
                        zak: meetingConfig.zak,
                    });

                    ZoomMtg.join({
                        zak: meetingConfig.zak,
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

                            attendSessionMutation.mutate({ sessionId }, {
                                onSettled: () => {
                                    if (session.data?.user.userRoles.includes("Teacher")) {
                                        ZoomMtg.record({
                                            record: true,
                                            success: (data: any) => {
                                                console.log("success", data);

                                            },
                                            error: (error: any) => {
                                                console.log("error", error);

                                            }
                                        })

                                        ZoomMtg.inMeetingServiceListener("onUserLeave", () => {
                                            ZoomMtg.endMeeting({})
                                            editSessionStatusMutation.mutate({ id: sessionId, sessionStatus: "Completed" });
                                        })
                                    }
                                }
                            })
                            if (session.data?.user.userRoles.some(role => role === "Teacher" || role === "Tester")) {
                                editSessionStatusMutation.mutate({ id: sessionId, sessionStatus: "Ongoing" });
                            }
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
