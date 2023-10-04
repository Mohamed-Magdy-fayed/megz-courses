import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/lib/api";
import "@/styles/globals.css";
import SnackbarContainer from "@/components/SnackbarContainer";
import Head from "next/head";
import Script from "next/script";
import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.FACEBOOK_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v18.0'
      });
    };
  }, [])
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Megz Courses App</title>
        <meta
          name="description"
          content="Your tool to manage and operate a coureses center"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SnackbarContainer></SnackbarContainer>
      <TooltipProvider>
        <Component {...pageProps} />
      </TooltipProvider>
      <Script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js" />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
