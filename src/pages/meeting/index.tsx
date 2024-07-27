import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import MeetingRoot from "@/components/ui/MeetingRoot";
import { Typography } from "@/components/ui/Typoghraphy";
import { useToast } from "@/components/ui/use-toast";
import useZoomMeeting from "@/hooks/useZoomMeeting";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function MeetingPage() {
    const { toastError } = useToast()
    const { data } = useSession()
    const router = useRouter()
    const name = data?.user?.name as string
    const email = data?.user?.email as string
    const mn = router.query.mn as string
    const pwd = router.query.pwd as string
    const sessionTitle = router.query.session_title as string
    const sessionId = router.query.session_id as string
    const leaveUrl = router.query.leave_url as string

    const { createClient, isJoining, userId } = useZoomMeeting()

    const generateSDKSignatureQuery = api.zoomMeetings.generateSDKSignature.useMutation({
        onSuccess: ({ meetingConfig, sdkKey }) => {
            createClient(meetingConfig, sdkKey || "", leaveUrl, sessionId)
        },
    })

    const join = () => {
        if (!name || !email || !mn || !pwd) return toastError("Please login to continue!")

        const meetingConfig = {
            mn,
            name,
            pwd,
            role: 0,
            email,
            lang: "en-US",
            signature: "",
            china: 0,
        }

        generateSDKSignatureQuery.mutate({
            meetingConfig,
        })
    }

    if (userId > 0) return <MeetingRoot />

    return (
        <div className="grid place-content-center min-h-screen">
            <div className="flex flex-col gap-12">
                <Typography className="text-9xl">{sessionTitle} Session</Typography>
                <Typography className="text-7xl">User Name: {name}</Typography>
                <Typography className="text-7xl">User Email: {email}</Typography>
                <Button className="text-5xl font-bold p-12" disabled={isJoining} type="button" onClick={join}>
                    <UserPlus className={cn("w-12 h-12", isJoining && "opacity-0")} />
                    <Typography className={cn(isJoining && "opacity-0")}>Join</Typography>
                    <Spinner className={cn("absolute w-12 h-12 opacity-0", isJoining && "opacity-100")} />
                </Button>
            </div>
            <Typography className={cn("absolute bottom-0 left-[40%] text-center right-[40%] whitespace-nowrap", isJoining && "opacity-0")}>Click the above button to join the meeting</Typography>
        </div>
    )
}