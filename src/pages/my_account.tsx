import { api } from "@/lib/api";
import { Account } from "@/components/users/accountComponents/Account";
import { AccountDetails } from "@/components/users/accountComponents/AccountDetails";
import { ConceptTitle, Typography } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/Spinner";
import LandingLayout from "@/components/landingPageComponents/LandingLayout";
import { Card, CardContent } from "@/components/ui/card";
import OrdersClient from "@/components/orders/OrdersClient";
import { useSession } from "next-auth/react";
import GoBackButton from "@/components/ui/go-back";

const Page = () => {
  const session = useSession();

  const { data, isLoading, error } = api.users.getCurrentUser.useQuery(undefined, { enabled: !!session.data?.user.isVerified });

  return (
    <LandingLayout>
      <div className="flex items-center gap-2 mb-4">
        <GoBackButton />
        <ConceptTitle>My Account</ConceptTitle>
      </div>
      {!session.data?.user.isVerified ? (
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
              <div className="col-span-full">
                <ConceptTitle className="whitespace-nowrap mb-8">My Orders History</ConceptTitle>
                <Card>
                  <CardContent>
                    <OrdersClient />
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
