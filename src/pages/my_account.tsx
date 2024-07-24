import { api } from "@/lib/api";
import { Account } from "@/components/users/accountComponents/Account";
import { AccountDetails } from "@/components/users/accountComponents/AccountDetails";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import { ArrowLeftFromLine } from "lucide-react";
import { useRouter } from "next/router";
import Spinner from "@/components/Spinner";
import LandingLayout from "@/components/landingPageComponents/LandingLayout";

const Page = () => {
  const router = useRouter();

  const userLoader = api.users.getCurrentUser.useQuery();

  return (
    <LandingLayout>
      {userLoader.isLoading || !userLoader.data?.user
        ? (<div className="w-full h-full grid place-content-center"><Spinner /></div>)
        : (
          <main className="flex-grow py-2">
            <div className="grid space-x-4 space-y-4 grid-cols-12">
              <div className="col-span-12 md:col-span-4 md:border-r-2 border-muted md:p-4">
                <div className="flex items-center gap-4 mb-8">
                  <Button variant={"icon"} customeColor={"primaryIcon"} onClick={() => router.back()}>
                    <ArrowLeftFromLine></ArrowLeftFromLine>
                  </Button>
                  <ConceptTitle>Account</ConceptTitle>
                </div>
                <Account user={userLoader.data.user} />
              </div>
              <div className="col-span-12 md:col-span-8">
                <ConceptTitle className="whitespace-nowrap mb-8">Account Details</ConceptTitle>
                <AccountDetails user={userLoader.data.user} />
              </div>
            </div>
          </main>
        )}
    </LandingLayout>
  );
};

export default Page;
