import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    const { createClient, userId, zoomClient, isJoining } = useZoomMeeting()

    const generateSDKSignatureQuery = api.zoomMeetings.generateSDKSignature.useMutation({
        onSuccess: ({ meetingConfig, sdkKey }) => {
            console.log(meetingConfig.signature);
            createClient(meetingConfig, sdkKey || "")
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

    return (
        <LandingLayout>
            <Card className="relative w-full min-h-[90vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{sessionTitle}</CardTitle>
                    {userId > 0
                        ? (
                            <Button type="button" onClick={() => {
                                zoomClient?.leaveMeeting()
                            }} customeColor={"destructive"}>
                                Leave
                            </Button>
                        )
                        : (
                            <Button disabled={isJoining} type="button" onClick={join}>
                                <UserPlus className={cn("w-4 h-4", isJoining && "opacity-0")} />
                                <Typography className={cn(isJoining && "opacity-0")}>Join</Typography>
                                <Spinner className={cn("absolute w-4 h-4 opacity-0", isJoining && "opacity-100")} />
                            </Button>
                        )}
                </CardHeader>
                <Separator />
                <CardContent className="flex-grow flex items-start justify-between">
                    <div id="root"></div>
                    <div id="activeApps" className="flex-grow"></div>
                </CardContent>
                <Separator />
                <CardFooter>
                </CardFooter>
            </Card>
        </LandingLayout >
    )
}