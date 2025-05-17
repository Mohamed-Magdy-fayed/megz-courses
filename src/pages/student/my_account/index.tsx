import { api } from "@/lib/api";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/ui/Spinner";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import GoBackButton from "@/components/ui/go-back";
import { AccountDetails } from "@/components/admin/usersManagement/users/accountComponents/AccountDetails";
import AccountPaymentClient from "@/components/admin/usersManagement/users/accountComponents/AccountPaymentClient";
import LandingLayout from "@/components/pages/landingPageComponents/LandingLayout";
import { Account } from "@/components/admin/usersManagement/users/accountComponents/Account";

const Page = () => {
  const session = useSession();

  const { data, isLoading, error } = api.users.getCurrentUser.useQuery(undefined, { enabled: !!session.data?.user.emailVerified });

  return (
    <LandingLayout>
      <div className="flex items-center gap-2 mb-4">
        <GoBackButton />
        <ConceptTitle>My Account</ConceptTitle>
      </div>
      {!session.data?.user.emailVerified ? (
        <Typography>Please verify your email!</Typography>
      ) : isLoading
        ? (<div className="w-full h-full grid place-content-center"><Spinner /></div>)
        : !data?.user || error ? (
          <div className="w-full h-full grid place-content-center">{error?.message}</div>
        ) : (
          <main className="flex-grow py-2">
            <div className="grid space-x-4 space-y-4 grid-cols-12">
              <div className="col-span-12 md:col-span-4 md:border-r-2 border-muted md:p-4">
                <Account user={data.user} />
              </div>
              <div className="col-span-12 md:col-span-8">
                <AccountDetails user={data.user} />
              </div>
              <div className="col-span-full space-y-4">
                <ConceptTitle className="whitespace-nowrap">My Orders History</ConceptTitle>
                <Card>
                  <CardContent>
                    <AccountPaymentClient data={data.user.orders} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        )}
    </LandingLayout>
  );
};

export default Page;
