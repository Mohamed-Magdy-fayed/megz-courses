import MegzDrawer from "@/components/layout/Drawer";
import MegzTopBar from "@/components/layout/TopBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavStore } from "@/zustand/store";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import Spinner from "../Spinner";
import UnauthorizedAccess from "./UnauthorizedAccess";
import { api } from "@/lib/api";
import { hasPermission } from "@/server/permissions";
import { useRouter } from "next/router";

const allowedByDefault = ["/redirects"]

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { Opened, openNav, closeNav } = useNavStore();
  const { pathname } = useRouter();

  const { data: session, status } = useSession({ required: true })
  const { data, refetch } = api.siteIdentity.getSiteIdentity.useQuery(undefined, { enabled: false })

  useEffect(() => { refetch() }, [])

  if (status === "loading" || !session.user) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  if (!hasPermission(session.user, "adminLayout", "view")) return <UnauthorizedAccess />
  if (!hasPermission(session.user, "screens", "view", { url: pathname })
    && (!allowedByDefault.some(url => pathname.startsWith(url))
      && pathname !== "/admin")) return <UnauthorizedAccess />

  return (
    <div className="flex">
      <Sheet
        open={Opened}
        onOpenChange={() => Opened ? closeNav() : openNav()}
      >
        <SheetContent side="left" className="p-0 w-min">
          <MegzDrawer siteIdentity={data?.siteIdentity} />
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block p-0 w-min">
        <MegzDrawer siteIdentity={data?.siteIdentity} />
      </div>
      <div className="w-full">
        <MegzTopBar siteIdentity={data?.siteIdentity} />
        <ScrollArea className="h-[calc(100vh-4rem)] flex-grow">
          <ScrollBar className="bg-primary/20" />
          <div className="p-4">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;
