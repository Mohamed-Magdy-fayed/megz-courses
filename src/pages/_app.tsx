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
        <title>Megz Courses App</title>
        <meta
          name="description"
          content="Your tool to manage and operate a coureses center"
        />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
