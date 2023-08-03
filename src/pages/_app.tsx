import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/lib/api";
import "@/styles/globals.css";
import SnackbarContainer from "@/components/SnackbarContainer";
import Head from "next/head";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DndProvider backend={HTML5Backend}>
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
      </DndProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
