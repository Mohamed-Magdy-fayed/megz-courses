import EmailConfirmationSuccess from "@/components/emails/EmailConfirmed";
import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { api } from "@/lib/api";
import { sendZohoEmail } from "@/lib/gmailHelpers";
import { render } from "@react-email/render";
import { CheckSquare, Settings2, XSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ConfirmEmailPage() {
    const router = useRouter()
    const id = router.query.id as string
    const accessToken = router.query.access_token as string

    const { update, data } = useSession()
    const [message, setMessage] = useState("")
    const [success, setSuccess] = useState<boolean>()

    const sendEmailMutation = api.emails.sendZohoEmail.useMutation()
    const confirmEmailMutation = api.auth.confirmUserEmail.useMutation()

    useEffect(() => {
        if (!id || !accessToken || message.length > 0) return
        confirmEmailMutation.mutate({
            id,
            accessToken,
        },
            {
                onSuccess: ({ user, emailConfirmationSuccessProps }) => {
                    setSuccess(true);
                    setMessage(user?.email || "");

                    if (data?.user.id === id) {
                        update({
                            isVerified: true,
                        });
                        update()
                    }

                    if (!emailConfirmationSuccessProps) return

                    const html = render(
                        <EmailConfirmationSuccess
                            {...emailConfirmationSuccessProps}
                        />
                    )

                    sendEmailMutation.mutate({
                        email: user.email,
                        html,
                        subject: `Congratulations, your email is now verified.`
                    })
                },
                onError: ({ message }) => {
                    setSuccess(false)
                    setMessage(message)
                },
            })
    }, [id, accessToken])

    return (
        <LandingLayout>
            <div className="grid place-content-center h-full">
                {
                    success === true
                        ? message === "Email already verified!" ? (
                            <>
                                <ConceptTitle>Your Email is already verified</ConceptTitle>
                                <CheckSquare className="text-success w-8 h-8 mx-auto my-8" />
                                <Link href="/my_account" className="mx-auto">
                                    <Button>Mange your account <Settings2 className="w-4 h-4 ml-2"></Settings2></Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <ConceptTitle>Your email: <span className="text-info">{message}</span> has been verified successfully</ConceptTitle>
                                <CheckSquare className="text-success w-8 h-8 mx-auto my-8" />
                                <Link href="/my_account" className="mx-auto">
                                    <Button>Mange your account <Settings2 className="w-4 h-4 ml-2"></Settings2></Button>
                                </Link>
                            </>
                        )
                        : success === undefined
                            ? (
                                <>
                                    <ConceptTitle>Verifing your email...</ConceptTitle>
                                    <Spinner className="w-8 h-8 mx-auto my-8" />
                                </>
                            )
                            : (
                                <>
                                    <ConceptTitle>Verification Failed! Error:{message}</ConceptTitle>
                                    <XSquare className="text-destructive w-8 h-8 mx-auto my-8" />
                                </>

                            )
                }
            </div>
        </LandingLayout>
    );
}