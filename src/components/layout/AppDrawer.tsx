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
      <nav
        aria-label="main-navigation"
      >
        {/* <Drawer
            variant="temporary"
            open={navStore.opened}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { sm: "block", xl: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            <MegzDrawer />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", xl: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            <MegzDrawer />
          </Drawer> */}
      </nav>
      <main
        className="w-full"
      >
        {children}
      </main>
    </div>
  );
}
