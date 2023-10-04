import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Dashboard from "@/components/overview/Dashboard";
import AppLayout from "@/layouts/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") router.push("/authentication");
  }, [session.status]);

  if (session.status === "loading") return <Skeleton className="w-screen h-screen"></Skeleton>;

  return (
    <AppLayout>
      <Dashboard></Dashboard>
    </AppLayout>
  );
};

export default Page;
