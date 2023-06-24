import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Spinner from "@/components/Spinner";
import AppDrawer from "@/components/layout/AppDrawer";
import { Toolbar } from "@mui/material";
import Dashboard from "@/components/overview/Dashboard";

const Page = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") router.push("/authentication");
  }, [session.status]);

  if (session.status === "loading") return <Spinner></Spinner>;

  return (
    <AppDrawer>
      <Toolbar />
      <Dashboard></Dashboard>
    </AppDrawer>
  );
};

export default Page;
