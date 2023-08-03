import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import { ActiveLinkType, useNavStore } from "@/zustand/store";
import { ThemeProvider, createTheme } from "@mui/material";
import { useRouter } from "next/router";
import Spinner from "../Spinner";
import MegzDrawer from "./Drawer";
import MegzTopBar from "./TopBar";

const drawerWidth = 240;

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});

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
    <ThemeProvider theme={theme}>
      <div className="flex flex-col">
        <MegzTopBar />
        <Box
          component="nav"
          sx={{ width: { xl: drawerWidth }, flexShrink: { xl: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
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
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { xl: `calc(100% - ${drawerWidth}px)` },
          }}
          className="w-full"
        >
          <Toolbar />
          {children}
        </Box>
      </div>
    </ThemeProvider>
  );
}
