import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import Spinner from "@/components/Spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import TierCard from "@/components/setupComponents/TierCard";
import SetupForm from "@/components/setupComponents/SetupForm";
import { subscriptionTiers } from "@/lib/system";
import SingleSelectField from "@/components/SingleSelectField";
import { SpinnerButton } from "@/components/ui/button";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { EditIcon } from "lucide-react";
import { RefreshCwIcon } from "lucide-react";
import { LogoPrimary } from "@/components/layout/Logo";
import Link from "next/link";
import { AlertModal } from "@/components/modals/AlertModal";
import { useSession } from "next-auth/react";


const SetupPage = () => {
  const setupQuery = api.setup.getCurrentSetup.useQuery();

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [loadingToast, setLoadingToast] = useState<toastType>();

  const { update: updateSession } = useSession()
  const { toast } = useToast()
  const trpcUtils = api.useUtils();
  const resetMutation = api.setup.reset.useMutation(
    createMutationOptions({
      loadingToast,
      setLoadingToast,
      successMessageFormatter: () => {
        setIsResetOpen(false)
        updateSession()
        return `Reset Completed!`
      },
      toast,
      trpcUtils,
      loadingMessage: "Resetting..."
    })
  )

  const onReset = () => {
    resetMutation.mutate()
  }

  if (setupQuery.isLoading) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  return (
    <ScrollArea className="h-screen">
      <AlertModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        loading={!!loadingToast}
        onConfirm={onReset}
        description="WARNING!!! you're about to reset your system, any lost data will not be recoverable!"
      />
      <div className="p-4 flex flex-col gap-8 items-center">
        <div className="grid grid-cols-12 w-full items-center">
          <Link href="/" className="col-span-3" >
            <LogoPrimary />
          </Link>
          <ConceptTitle className="text-center leading-8 col-span-6">Welcome To <br></br>Megz Teaching Setup</ConceptTitle>
          <SpinnerButton className="ml-auto col-span-3" customeColor="destructiveOutlined" onClick={() => setIsResetOpen(true)} text="Reset Setup" icon={RefreshCwIcon} isLoading={!!loadingToast} />
        </div>
        <Separator />
        {!setupQuery.data?.Admin && (
          <>
            <Typography
              className="text-center"
              variant={"bodyText"}
            >
              From here you can setup your super Admin account using the{" "}
              <WrapWithTooltip
                text="This is the key you obtained when purchasing your Megz Learning license!">
                <strong
                  className="text-primary"
                >
                  setup key
                </strong>
              </WrapWithTooltip>
              {" "}provided by the Megz Teaching team
            </Typography>
            <SetupForm />
          </>
        )}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <TierCard currentTier={subscriptionTiers.Starter} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Starter.name} />
          <TierCard currentTier={subscriptionTiers.Basic} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Basic.name} />
          <TierCard currentTier={subscriptionTiers.Professional} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Professional.name} />
          <TierCard currentTier={subscriptionTiers.Enterprise} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Enterprise.name} />
        </div>
      </div>
    </ScrollArea>
  )
};

export default SetupPage;
