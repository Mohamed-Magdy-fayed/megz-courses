import * as React from "react";
import { ActiveLinkType, useNavStore } from "@/zustand/store";
import { useRouter } from "next/router";
import Spinner from "../Spinner";
import MegzDrawer from "./Drawer";
import MegzTopBar from "./TopBar";

interface AppDrawerProps {
  children: React.ReactNode;
}

export default function AppDrawer({ children }: AppDrawerProps) {
  const navStore = useNavStore((state) => state);
  const router = useRouter();

  const handleDrawerToggle = () => {
    navStore.opened ? navStore.closeNav() : navStore.openNav();
  };

  React.useEffect(() => {
    navStore.setActiveLink(
      router.route.toString().substring(1) as ActiveLinkType
    );
  }, []);

  if (navStore.activeLink == null) return <Spinner></Spinner>;

  return (
    <div className="flex flex-col">
      <MegzTopBar />
      <main
        className="w-full"
      >
        {children}
      </main>
    </div>
  );
}
