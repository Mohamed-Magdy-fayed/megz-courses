import MegzDrawer from "@/components/layout/Drawer";
import MegzTopBar from "@/components/layout/TopBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavStore } from "@/zustand/store";
import { SwipeableDrawer } from "@mui/material";
import { ReactNode } from "react";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { opened, openNav, closeNav } = useNavStore();

  return (
    <div className="flex">
      <SwipeableDrawer
        anchor="left"
        open={opened}
        onClose={() => closeNav()}
        onOpen={() => openNav()}
      >
        <MegzDrawer />
      </SwipeableDrawer>
      <div className="hidden lg:block">
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
