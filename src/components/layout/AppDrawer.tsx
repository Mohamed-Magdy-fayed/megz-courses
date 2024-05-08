import { ActiveLinkType, useNavStore } from "@/zustand/store";
import { useRouter } from "next/router";
import Spinner from "../Spinner";
import MegzTopBar from "./TopBar";
import { ReactNode, useEffect } from "react";

interface AppDrawerProps {
  children: ReactNode;
}

export default function AppDrawer({ children }: AppDrawerProps) {
  const navStore = useNavStore((state) => state);
  const router = useRouter();

  const handleDrawerToggle = () => {
    navStore.opened ? navStore.closeNav() : navStore.openNav();
  };

  useEffect(() => {
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
