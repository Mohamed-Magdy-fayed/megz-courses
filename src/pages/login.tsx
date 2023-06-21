import LoginForm from "@/components/LoginForm";
import { Button } from "@mui/material";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/router";

const Page = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") router.push("/");
  }, [session.status]);

  if (session.status === "loading") return <Spinner></Spinner>;

  return (
    <main className="grid min-h-screen place-content-center bg-slate-50">
      <LoginForm></LoginForm>
      <div className="grid place-content-center border-t border-t-slate-700 pt-8">
        <Button
          className="flex items-center gap-4 bg-slate-200 normal-case text-slate-700 hover:bg-slate-300"
          onClick={() => signIn("google")}
        >
          <GoogleIcon className="text-[#DB4437]"></GoogleIcon>
          Sign in with Google
        </Button>
      </div>
    </main>
  );
}

export default Page;
