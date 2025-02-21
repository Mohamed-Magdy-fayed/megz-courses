import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/lib/api";
import "@/styles/globals.css";
import Head from "next/head";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Gateling TMS</title>
        <meta
          name="description"
          content="Your gateway to manage and operate your academy"
        />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
