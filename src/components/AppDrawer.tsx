import * as React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { ActiveLinkType, useNavStore } from "@/zustand/store";
import Navbar from "./Navbar";
import { ThemeProvider, createTheme } from "@mui/material";
import { useRouter } from "next/router";
import Spinner from "./Spinner";
import { usePathname } from "next/navigation";

const drawerWidth = 240;

declare module "@mui/material/styles" {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

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

interface AppDrawerPrps {
  children: React.ReactNode;
}

export default function AppDrawer({ children }: AppDrawerPrps) {
  const navStore = useNavStore((state) => state);
  const active = "!text-slate-100 !bg-slate-100/10";
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

  const drawer = (
    <Box
      component="div"
      className="flex min-h-screen flex-col gap-4 bg-primary p-4"
    >
      <img src="/favicon.png" className="w-20" />
      <Box component="div" className="rounded-lg bg-slate-100/10 p-4">
        <Typography className="font-sans text-xl font-bold text-slate-50">
          Megz
        </Typography>
        <Typography className="text-sm text-slate-300">Development</Typography>
      </Box>
      <Divider></Divider>
      <Box
        component="div"
        className="flex flex-col items-center gap-2 [&>*]:w-full [&>*]:rounded-lg [&>*]:bg-transparent [&>*]:p-2 [&>*]:font-bold [&>*]:text-slate-300 hover:[&>*]:bg-slate-100/10"
      >
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "" ? active : ""}
          href="/"
        >
          Overview
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "students" ? active : ""}
          href="/students"
        >
          Students
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "staff" ? active : ""}
          href="/staff"
        >
          Staff
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "account" ? active : ""}
          href="/account"
        >
          Account
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "settings" ? active : ""}
          href="/settings"
        >
          Settings
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "login" ? active : ""}
          href="/authentication"
        >
          Login or Register
        </Link>
        <Link
          onClick={() => navStore.closeNav()}
          className={navStore.activeLink === "404" ? active : ""}
          href="/404"
        >
          Error
        </Link>
      </Box>
      <Divider></Divider>
      <Box component="div">
        <Typography className="text-base text-slate-50">
          Need different featrues?
        </Typography>
        <Typography className="text-sm text-slate-300">
          <Link
            className="text-dark underline decoration-slate-700 hover:decoration-dark"
            href="https://portfolio-2-iota-brown.vercel.app/"
            target="_blank"
          >
            Contact
          </Link>{" "}
          me for customizations
        </Typography>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Navbar drawerWidth={drawerWidth} />
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
            {drawer}
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
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { xl: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
