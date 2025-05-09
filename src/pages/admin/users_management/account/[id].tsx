import { api } from "@/lib/api";
import { useRouter } from "next/router";
import AppLayout from "@/components/pages/adminLayout/AppLayout";
import { ArrowLeftFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConceptTitle } from "@/components/ui/Typoghraphy";
import Spinner from "@/components/ui/Spinner";
import { Prisma } from "@prisma/client";
import { Account } from "@/components/admin/usersManagement/users/accountComponents/Account";
import { AccountDetails } from "@/components/admin/usersManagement/users/accountComponents/AccountDetails";
import { UserAccountTabs } from "@/components/admin/usersManagement/users/accountComponents/AccountTabs";

export type UserGetPayload = Prisma.UserGetPayload<{
  include: {
    orders: { include: { product: { include: { productItems: { include: { course: { include: { levels: true, orders: { include: { user: true } } } } } } } } } },
    evaluationFormSubmissions: true,
    zoomGroups: { include: { zoomSessions: true, Teacher: { include: { user: true } }, course: true, students: true, courseLevel: true }, },
    placementTests: {
      include: {
        tester: { include: { user: true } },
        course: { include: { levels: true } },
        student: { include: { courseStatus: { include: { level: true } } } },
        writtenTest: { include: { submissions: true } },
        zoomSessions: true,
      }
    },
    studentNotes: { include: { createdByUser: true, mentions: true } },
    courseStatus: true,
    certificates: { include: { course: true, courseLevel: true, user: true } }
  },
}>

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;

  const { data, isLoading } = api.users.getUserById.useQuery({ id }, { enabled: !!id });

  return (
    <AppLayout>
      {isLoading || !data?.user
        ? (<div className="w-full h-full grid place-content-center"><Spinner /></div>)
        : (
          <main className="flex-grow py-2 flex flex-col gap-4">
            <div className="grid space-x-4 space-y-4 grid-cols-12">
              <div className="col-span-12 md:col-span-4 md:border-r-2 border-muted md:p-4">
                <div className="flex items-center gap-4 mb-8">
                  <Button variant={"icon"} customeColor={"primaryIcon"} onClick={() => router.back()}>
                    <ArrowLeftFromLine></ArrowLeftFromLine>
                  </Button>
                  <ConceptTitle>Account</ConceptTitle>
                </div>
                <Account user={data.user} />
              </div>
              <div className="col-span-12 md:col-span-8">
                <ConceptTitle className="whitespace-nowrap mb-8">Account Details</ConceptTitle>
                <AccountDetails user={data.user} />
              </div>
            </div>
            <UserAccountTabs user={data.user} />
          </main>
        )}
    </AppLayout>
  );
}
