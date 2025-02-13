import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import Spinner from "@/components/Spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import SetupForm from "@/components/setupComponents/SetupForm";
import { SpinnerButton } from "@/components/ui/button";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { RefreshCwIcon } from "lucide-react";
import { LogoPrimary } from "@/components/layout/Logo";
import Link from "next/link";
import { AlertModal } from "@/components/modals/AlertModal";
import { useSession } from "next-auth/react";
import NotFoundPage from "@/pages/404";

const SetupPage = () => {
  const setupQuery = api.setup.getCurrentSetup.useQuery();

  const [isResetOpen2, setIsResetOpen2] = useState(false);
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
  const resetMutation2 = api.setup.reset2.useMutation(
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

  const onReset = async () => {
    resetMutation.mutate()
  }

  const onReset2 = async () => {
    resetMutation2.mutate()
  }

  if (setupQuery.isLoading) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  if (setupQuery.data?.Admin?.email) return (
    <NotFoundPage />
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
      <AlertModal
        isOpen={isResetOpen2}
        onClose={() => setIsResetOpen2(false)}
        loading={!!loadingToast}
        onConfirm={onReset2}
        description="WARNING!!! you're about to reset your system, any lost data will not be recoverable!"
      />
      <div className="p-4 flex flex-col gap-8 items-center">
        <div className="grid grid-cols-12 w-full items-center">
          <Link href="/" className="col-span-3" >
            <LogoPrimary />
          </Link>
          <ConceptTitle className="text-center leading-8 col-span-6">Welcome To <br></br>Gateling TMS Setup</ConceptTitle>
          <div>
            {/* <SpinnerButton className="ml-auto col-span-3" customeColor="destructiveOutlined" onClick={() => setIsResetOpen(true)} text="Reset Setup" icon={RefreshCwIcon} isLoading={!!loadingToast} />
            <SpinnerButton className="ml-auto col-span-3" customeColor="destructiveOutlined" onClick={() => setIsResetOpen2(true)} text="Reset Setup" icon={RefreshCwIcon} isLoading={!!loadingToast} /> */}
          </div>
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
                text="This is the key you obtained when purchasing your Gateling TMS license!">
                <strong
                  className="text-primary"
                >
                  setup key
                </strong>
              </WrapWithTooltip>
              {" "}provided by the Gateling team
            </Typography>
            <SetupForm />
          </>
        )}
        {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <TierCard currentTier={subscriptionTiers.Starter} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Starter.name} />
          <TierCard currentTier={subscriptionTiers.Basic} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Basic.name} />
          <TierCard currentTier={subscriptionTiers.Professional} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Professional.name} />
          <TierCard currentTier={subscriptionTiers.Enterprise} isCurrent={setupQuery.data?.tier.name === subscriptionTiers.Enterprise.name} />
        </div> */}
      </div>
    </ScrollArea>
  )
};

export default SetupPage;
