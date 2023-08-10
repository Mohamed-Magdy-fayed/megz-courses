import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { Button as UiButton } from "@/components/ui/button";
import Tooltip from "@mui/material/Tooltip";
import { signOut, useSession } from "next-auth/react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";
import { useRouter } from "next/router";
import { useNavStore, useTutorialStore } from "@/zustand/store";
import { usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { SkipForward } from "lucide-react";

export default function MegzTopBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const session = useSession();
  const router = useRouter();
  const navStore = useNavStore((state) => state);
  const pathname = usePathname();
  const { skipTutorial, steps, setStep, setSkipTutorial } = useTutorialStore();

  const handlePathnameChange = React.useCallback(() => {
    if (navStore.opened) {
      navStore.closeNav();
    }
  }, [navStore.opened]);

  React.useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

  return (
    <AppBar
      className={`top-0 !bg-white/80 !shadow-none !backdrop-blur-sm`}
      position="sticky"
    >
      <Toolbar disableGutters className="flex justify-between p-2">
        <Box component="div" className="flex items-center gap-2">
          <Popover
            open={!steps.openMenu && !skipTutorial && router.route === "/"}
          >
            <PopoverTrigger asChild>
              <Tooltip title="Navigation">
                <IconButton
                  className={cn(
                    "lg:!hidden",
                    !steps.openMenu &&
                      !skipTutorial &&
                      router.route === "/" &&
                      "tutorial-ping"
                  )}
                  onClick={() => {
                    navStore.openNav();
                    !steps.openMenu && setStep(true, "openMenu");
                  }}
                >
                  <MenuIcon
                    sx={{
                      fontSize: "20px",
                    }}
                  ></MenuIcon>
                </IconButton>
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              className="fixed translate-y-4 lg:hidden"
            >
              <div className="flex flex-col justify-center gap-4 lg:hidden">
                <Typography>Checkout the latest update!</Typography>
                <UiButton
                  onClick={() => setSkipTutorial(true)}
                  variant={"outline"}
                  className="whitespace-nowrap text-slate-700"
                >
                  <Typography>Skip tutorial</Typography>
                  <SkipForward className="ml-2 h-4 w-4" />
                </UiButton>
              </div>
            </PopoverContent>
          </Popover>
          <Box
            component="div"
            className="flex cursor-pointer gap-2 font-sans text-slate-500"
            onClick={() => router.push("/")}
          >
            <Avatar className="h-6 w-6" alt="Logo" src="/favicon.png" /> Courses
          </Box>
        </Box>
        <Box component="div" className="flex items-center gap-2">
          <IconButton>
            <NotificationsIcon></NotificationsIcon>
          </IconButton>
          <IconButton>
            <PeopleIcon></PeopleIcon>
          </IconButton>
          <Tooltip title="Profile menu">
            <IconButton aria-label="menuButton" onClick={handleClick}>
              <Avatar
                className="h-8 w-8 cursor-pointer outline outline-primary/30 hover:outline-primary/70"
                alt={session.data?.user.name || "NA"}
                src={session.data?.user.image || ""}
              />
            </IconButton>
          </Tooltip>
          <Menu
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            MenuListProps={{
              sx: {
                p: 0,
              },
            }}
          >
            <Box component="div" className="p-2">
              <Typography
                variant="body1"
                fontWeight={500}
                className="text-slate-700"
              >
                Account
              </Typography>
              <Typography variant="caption" color="GrayText">
                {session.data?.user.name}
              </Typography>
            </Box>
            <Divider></Divider>
            <Button onClick={() => signOut()} className="m-2 min-w-[10rem]">
              Sign out
            </Button>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
