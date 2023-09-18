import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import Dashboard from "@/components/overview/Dashboard";
import AppLayout from "@/layouts/AppLayout";
import axios from "axios";

const Page = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") router.push("/authentication");
  }, [session.status]);

  if (session.status === "loading") return <Spinner></Spinner>;

  return (
    <AppLayout>
      <Dashboard></Dashboard>
    </AppLayout>
  );
};

export default Page;
