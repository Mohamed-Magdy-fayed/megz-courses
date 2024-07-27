import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Copyright from "@/components/Copyright";
import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/authComponents/AuthForm";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ResetPasswordForm from "@/components/authComponents/ResetPasswordForm";
import { Card, CardHeader } from "@/components/ui/card";
import { Lock } from "lucide-react";

const AuthenticationPage = () => {
  const defaultVariant = useRouter().query.variant as "login" | "register"
  const [open, setOpen] = useState<boolean>(false);
  const [variant, setVariant] = useState<"login" | "register">(defaultVariant || "login");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") session.data.user.userType === "student" ? router.push("/") : router.push("/dashboard");
  }, [session.status]);

  useEffect(() => {
    if(!defaultVariant) router.push("authentication?variant=login")
    setVariant(defaultVariant)
  }, [defaultVariant]);

  return (
    <main className="min-h-screen bg-background p-4 grid gap-8 grid-cols-1 lg:grid-cols-2">
      <div className="space-y-4 min-w-[24rem] mx-auto">
        {variant === "register" ? (
          <Card className="mt-2 flex flex-col items-center mx-auto">
            <CardHeader className="flex flex-col items-center p-4">
              <Lock />
              <Typography variant={"primary"}>
                Sign up
              </Typography>
            </CardHeader>
            <AuthForm authType="register" />
          </Card>
        ) : (
          <Card className="mt-2 flex flex-col items-center mx-auto">
            <CardHeader className="flex flex-col items-center p-4">
              <Lock />
              <Typography variant={"primary"}>
                Login
              </Typography>
            </CardHeader>
            <AuthForm authType="login"></AuthForm>
          </Card>
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
            <Dialog
              open={open}
              onOpenChange={setOpen}
            >
              <DialogTrigger asChild>
                <Button variant="link" onClick={() => setOpen(true)}>
                  Forgot password?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ResetPasswordForm setOpen={setOpen}></ResetPasswordForm>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center">
            <Typography>
              {variant === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </Typography>
            <Button
              variant="link"
              onClick={() => {
                setVariant(variant === "login" ? "register" : "login")
                router.push(variant === "login" ? "authentication?variant=register" : "authentication?variant=login")
              }
              }
            >
              <Typography className="ml-1">
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
