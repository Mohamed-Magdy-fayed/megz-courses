import MegzDrawer from "@/components/layout/Drawer";
import MegzTopBar from "@/components/layout/TopBar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavStore } from "@/zustand/store";
import { ReactNode } from "react";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { opened, openNav, closeNav } = useNavStore();

  return (
    <div className="flex">
      <Sheet
        open={opened}
        onOpenChange={() => opened ? closeNav() : openNav()}
      >
        <SheetContent side="left" className="p-0 w-min">
          <MegzDrawer mobile />
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
