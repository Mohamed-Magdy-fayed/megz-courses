import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Copyright from "@/components/Copyright";
import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/Typoghraphy";
import { Button } from "@/components/ui/button";
import AuthForm from "@/components/general/authComponents/AuthForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ResetPasswordForm from "@/components/general/authComponents/ResetPasswordForm";
import { Card, CardHeader } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/Spinner";
import { hasPermission } from "@/server/permissions";
import Link from "next/link";
import Image from "next/image";
import authImage from '../../public/authImage.jpg'

const AuthenticationPage = () => {
  const defaultVariant = useRouter().query.variant as "login" | "register"
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [variant, setVariant] = useState<"login" | "register">(defaultVariant || "login");
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    setLoading(true)
    if (session.status === "authenticated") !hasPermission(session.data.user, "adminLayout", "view")
      ? router.push("/")
      : router.push(hasPermission(session.data.user, "screens", "view", { url: "dashboard" }) ? "/admin/dashboard" : "/admin");
    if (session.status !== "loading" && session.status !== "authenticated") setLoading(false)
  }, [session.status]);

  useEffect(() => {
    if (!defaultVariant) router.push("authentication?variant=login")
    setVariant(defaultVariant)
  }, [defaultVariant]);

  const handleGoogleSignin = () => {
    setLoading(true)
    signIn("google")
  }

  if ((session.status === "loading" || session.status === "authenticated") && loading) return (
    <Spinner className="mx-auto" />
  )

  if (session.status === "loading" && !loading) return (
    <main className="min-h-screen bg-background p-4 grid gap-8 grid-cols-1 lg:grid-cols-2">
      <div className="w-fit mx-auto">
        <div className="space-y-4 min-w-[24rem] mx-auto max-w-md">
          <div className="mt-2 flex flex-col items-center mx-auto">
            <div className="flex flex-col items-center p-4">
              <Lock />
              <Typography variant={"primary"}>
                Login
              </Typography>
            </div>
            <Skeleton className="w-80 h-80"></Skeleton>
          </div>
          <div className="grid place-content-center gap-2">
            <Skeleton className="h-10 w-60" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        </div>
      </div>
      <Skeleton />
    </main>
  )

  return (
    <main className="min-h-screen bg-background p-4 grid gap-8 grid-cols-1 lg:grid-cols-2">
      <ScrollArea className="h-[80vh] w-full">
        <div className="space-y-4 min-w-[24rem] mx-auto max-w-md">
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
              disabled={loading}
              customeColor={"destructiveOutlined"}
              onClick={handleGoogleSignin}
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
            <div>
              <Link href="/">
                <Button variant="link">
                  Continue to home page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Image className="object-contain lg:grid place-content-center h-[80vh] w-full hidden" src="/authImage.jpg" alt="Image" width={500} height={500}></Image>
      <div className="lg:col-span-2">
        <div className="grid place-content-center border-t border-t-muted pt-8">
          <Copyright />
        </div>
      </div>
    </main >
  );
};

export default AuthenticationPage;
