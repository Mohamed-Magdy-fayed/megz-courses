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

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { opened, openNav, closeNav } = useNavStore();

  const { data: session, status } = useSession({ required: true })
  const mutation = api.zoomGroups.zoomGroupsCronJob.useMutation()
  const trpcUtils = api.useContext()

  useEffect(() => {
    mutation.mutate(undefined, { onSettled: () => trpcUtils.invalidate() })
  }, [new Date().getMinutes()])

  if (status === "loading" || !session.user) return (
    <div className="grid place-content-center w-screen h-screen">
      <Spinner />
    </div>
  )

  if (session.user.userType === "student") return <UnauthorizedAccess />

  return (
    <div className="flex">
      <Sheet
        open={opened}
        onOpenChange={() => opened ? closeNav() : openNav()}
      >
        <SheetContent side="left" className="p-0 w-min">
          <MegzDrawer />
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block p-0 w-min">
        <MegzDrawer />
      </div>
      <div className="w-full">
        <MegzTopBar />
        <ScrollArea className="h-[calc(100vh-4rem)] flex-grow">
          <ScrollBar className="bg-primary/20" />
          <div className="p-4">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppLayout;
