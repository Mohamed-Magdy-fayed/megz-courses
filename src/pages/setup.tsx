import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import Spinner from "@/components/ui/Spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import SetupForm from "@/components/admin/systemManagement/setupComponents/SetupForm";
import { useState } from "react";
import { toastType, useToast } from "@/components/ui/use-toast";
import { createMutationOptions } from "@/lib/mutationsHelper";
import { LogoPrimary } from "@/components/pages/adminLayout/Logo";
import Link from "next/link";
import { AlertModal } from "@/components/general/modals/AlertModal";
import { useSession } from "next-auth/react";
import NotFoundPage from "@/pages/404";
import { SpinnerButton } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

const SetupPage = () => {
  const setupQuery = api.setup.getCurrentSetup.useQuery();

  const { update: updateSession } = useSession()
  const { toast } = useToast()
  const trpcUtils = api.useUtils();

  if (setupQuery.isLoading) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  if (setupQuery.data?.Admin?.email && !setupQuery.data?.isDebugMode) return (
    <NotFoundPage />
  )

  return (
    <ScrollArea className="h-screen">
      <div className="p-4 flex flex-col gap-8 items-center">
        <div className="grid grid-cols-12 w-full items-center">
          <Link href="/" className="col-span-3" >
            <LogoPrimary />
          </Link>
          <ConceptTitle className="text-center leading-8 col-span-6">Welcome To <br></br>Gateling TMS Setup</ConceptTitle>
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
      </div>
    </ScrollArea>
  )
};

export default SetupPage;
