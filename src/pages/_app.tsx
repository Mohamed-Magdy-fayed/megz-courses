import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import SnackbarContainer from "@/components/SnackbarContainer";
import Head from "next/head";

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SnackbarContainer></SnackbarContainer>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
