import * as React from "react";
import { Button, Grid, Link, Typography } from "@mui/material";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import RegisterForm from "@/components/RegisterForm";
import GoogleIcon from "@mui/icons-material/Google";
import LoginForm from "@/components/LoginForm";
import Copyright from "@/components/Copyright";

const Page = () => {
  const [variant, setVariant] = React.useState<"login" | "register">("login");
  const session = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (session.status === "authenticated") router.push("/");
  }, [session.status]);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      {variant === "register" ? (
        <RegisterForm></RegisterForm>
      ) : (
        <LoginForm></LoginForm>
      )}
      <Grid container>
        <Grid item xs>
          <Link href="#" variant="body2">
            Forgot password?
          </Link>
        </Grid>
        <Grid item className="flex items-center gap-2">
          <Typography variant="body2">
            {variant === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
          </Typography>
          <Button
            disableRipple
            className="bg-transparent normal-case underline decoration-primary/30 hover:bg-transparent hover:underline hover:decoration-primary/70"
            onClick={() =>
              setVariant(variant === "login" ? "register" : "login")
            }
          >
            <Typography variant="body2">
              {variant === "login" ? "Sign Up" : "Sign In"}
            </Typography>
          </Button>
        </Grid>
      </Grid>
      <Copyright sx={{ mt: 8, mb: 4 }} />
      <div className="mt-8 grid place-content-center border-t border-t-slate-700 pt-8">
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
};

export default Page;
