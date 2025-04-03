import { SpinnerButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/Typoghraphy";
import { toastType, useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { SubscriptionTier, subscriptionTiers } from "@/lib/system";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { EditIcon } from "lucide-react";
import { useState } from "react";

export default function TierCard({ currentTier, isCurrent }: { currentTier: SubscriptionTier, isCurrent?: boolean }) {
    const [loadingToast, setLoadingToast] = useState<toastType>();

    const { toast } = useToast()
    const trpcUtils = api.useUtils();
    const updateMutation = api.setup.update.useMutation(
        createMutationOptions({
            loadingToast,
            setLoadingToast,
            successMessageFormatter: () => `Your update request has been sent, we will contact you soon!`,
            toast,
            trpcUtils,
            loadingMessage: "Reuqesting..."
        })
    )

    const onUpdate = () => {
        updateMutation.mutate({ requestedTier: currentTier.name })
    }

    return (
        <Card className={isCurrent ? "bg-primary/5" : ""}>
            <CardHeader>
                <CardTitle>{currentTier.name} Tier</CardTitle>
                <CardDescription className="h-12">
                    {currentTier.name === "Starter" ? "Free" : (
                        <>
                            Pay {formatPrice(currentTier.price)} /mo OR<br />
                            Pay {formatPrice(currentTier.yearPrice)} /year<br />
                            and save {((currentTier.price + 1) * 12) - (currentTier.yearPrice + 1)} EGP!
                        </>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid">
                <div className="flex items-center justify-between gap-4">
                    <Typography>Number Of Admins</Typography>
                    <Typography>{currentTier.teamMembers}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Number Of Courses</Typography>
                    <Typography>{currentTier.courses}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Number Of Instructors</Typography>
                    <Typography>{currentTier.instructors}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Number Of Students</Typography>
                    <Typography>{currentTier.students}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Storage</Typography>
                    <Typography>{currentTier.storage} GB</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Extra Storage Cost</Typography>
                    <Typography>{currentTier.extraStorageCost}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Remove Branding</Typography>
                    <Typography>{currentTier.removeBranding ? "Yes" : "No"}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Custom Domain</Typography>
                    <Typography>{currentTier.customDomain ? "Yes" : "No"}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Hosing</Typography>
                    <Typography>{currentTier.hosting}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Change Requests / year</Typography>
                    <Typography>{currentTier.changeRequests} free/year</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Technical Support</Typography>
                    <Typography>{currentTier.support}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Onboarding Training</Typography>
                    <Typography>{currentTier.freeTraining ? "Free" : "Paid"}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>On-site Training</Typography>
                    <Typography>{currentTier.freeOnSiteTraining ? "Free" : "Paid"}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Can Customize Domain</Typography>
                    <Typography>{currentTier.crmFeatures ? "Yes" : "No"}</Typography>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                    <Typography>Online Payment</Typography>
                    <Typography>{currentTier.onlinePayment ? "Yes" : "No"}</Typography>
                </div>
                <Separator />
            </CardContent>
            <CardFooter className="grid place-content-center">
                {isCurrent ? (
                    <Typography className="text-destructive">
                        {currentTier.name === "Starter" ? "Free" : `Renews on: ${format(new Date().setDate(new Date().getDate() + 30), "PPP")}`}
                    </Typography>
                ) : (
                    <SpinnerButton onClick={onUpdate} text="Request Change" icon={EditIcon} isLoading={!!loadingToast} />
                )}
            </CardFooter>
        </Card>
    )
}
