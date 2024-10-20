import Spinner from '@/components/Spinner';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/Typoghraphy'
import { toastType, useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { formatPercentage } from '@/lib/utils'
import React, { FC, useState } from 'react'

type GoogleTestSubmittedProps = {
    score: number;
    totalPoints: number;
    isSubmitted: boolean;
    formUrl: string;
    formRespondUrl: string;
    clientId: string;
}

export const GoogleTestResult: FC<GoogleTestSubmittedProps> = ({ score, clientId, formUrl, formRespondUrl, totalPoints, isSubmitted }) => {
    const [createSubmissionToast, setCreateSubmissionToast] = useState<toastType>()

    const { toast } = useToast()
    const formattedScore = formatPercentage(score / totalPoints * 100)

    const trpcUtils = api.useUtils()
    const checkSubmissionMutation = api.googleAccounts.getGoogleFormResponses.useMutation({
        onMutate: () => {
            setCreateSubmissionToast(
                toast({
                    title: "Checking...",
                    description: <Spinner className="w-4 h-4" />,
                    duration: 100000,
                    variant: "info",
                })
            )
        },
        onSuccess: ({ userResponse }) => createSubmissionToast?.update({
            id: createSubmissionToast.id,
            title: "Success",
            description: <Typography>
                Thank you, You scored {userResponse.totalScore} of {totalPoints} points With a percentage of {formatPercentage(userResponse.totalScore! / totalPoints * 100)}
            </Typography>,
            duration: 3000,
            variant: "success",
        }),
        onError: ({ message }) => createSubmissionToast?.update({
            id: createSubmissionToast.id,
            title: "Ops!",
            description: message,
            duration: 3000,
            variant: "destructive",
        }),
        onSettled: () => {
            trpcUtils.invalidate().then(() => {
                createSubmissionToast?.dismissAfter()
                setCreateSubmissionToast(undefined)
            })
        },
    })

    const handleCheckSubmission = () => {
        checkSubmissionMutation.mutate({
            url: formUrl,
            clientId,
        })
    }

    return isSubmitted ? (
        <Typography>Submitted Already - {formattedScore}</Typography>
    )
        : (
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    className="relative"
                    disabled={!!createSubmissionToast}
                    onClick={() => window.open(formRespondUrl, "_blank")}
                    customeColor={"info"}
                >
                    {!!createSubmissionToast && <Spinner className="w-4 h-4 mr-2" />}
                    <Typography>
                        {!!createSubmissionToast ? "Loading..." : "Go to form"}
                    </Typography>
                </Button>
                <Button
                    type="button"
                    className="relative"
                    disabled={!!createSubmissionToast}
                    onClick={handleCheckSubmission}
                    customeColor={"success"}
                >
                    {!!createSubmissionToast && <Spinner className="w-4 h-4 mr-2" />}
                    <Typography>
                        {!!createSubmissionToast ? "Loading..." : "Check my result"}
                    </Typography>
                </Button>
            </div>
        )
}
