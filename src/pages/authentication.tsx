import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Copyright from "@/components/Copyright";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/authComponents/AuthForm";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";

const AuthenticationPage = () => {
  const defaultVariant = useRouter().query.variant as "login" | "register"
  const [variant, setVariant] = useState<"login" | "register">(defaultVariant || "login");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") router.push("/");
  }, [session.status]);

  return (
    <main className="min-h-screen bg-background p-4 grid gap-8 grid-cols-1 lg:grid-cols-2">
      <div className="space-y-4 min-w-[24rem] mx-auto">
        {variant === "register" ? (
          <AuthForm authType="register"></AuthForm>
        ) : (
          <AuthForm authType="login"></AuthForm>
        )}
        <div className="grid place-content-center gap-2">
          <Button
            variant={"outline"}
            customeColor={"destructiveOutlined"}
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </Button>
          <div>
            <Link href="/">
              Forgot password?
            </Link>
          </div>
          <div className="flex items-center">
            <Typography>
              {variant === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </Typography>
            <Button
              variant="link"
              onClick={() =>
                setVariant(variant === "login" ? "register" : "login")
              }
            >
              <Typography >
                {variant === "login" ? "Sign Up" : "Sign In"}
              </Typography>
            </Button>
          </div>
        </div>
      </div>
      <Skeleton className="w-full h-full lg:grid place-content-center hidden" >
        <ImageIcon size={200}></ImageIcon>
      </Skeleton>
      <div className="lg:col-span-2">
        <div className="grid place-content-center border-t border-t-slate-700 pt-8">
          <Copyright />
        </div>
      </div>
    </main>
  );
};

export default AuthenticationPage;
