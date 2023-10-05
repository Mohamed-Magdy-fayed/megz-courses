import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useNavStore } from "@/zustand/store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { MenuIcon, BellIcon, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Typography } from "../ui/Typoghraphy";
import { Separator } from "../ui/separator";
import { useCallback, useEffect, useState } from "react";

export default function MegzTopBar() {
  const session = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const navStore = useNavStore((state) => state);
  const pathname = usePathname();

  const handlePathnameChange = useCallback(() => {
    if (navStore.opened) {
      navStore.closeNav();
    }
  }, [navStore.opened]);

  useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

  return (
    <div
      className={`relative z-50 isolate top-0 !bg-white/80 !shadow-none !backdrop-blur-sm`}
    >
      <div className="flex justify-between p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="icon"
                className={cn("lg:!hidden")}
                onClick={() => {
                  navStore.openNav();
                }}
              >
                <MenuIcon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
          <div
            className="flex items-center cursor-pointer gap-2 font-sans text-slate-500"
            onClick={() => router.push("/")}
          >
            <Avatar className="h-6 w-6" >
              <AvatarImage src="/favicon.png" alt="Logo" />
              <AvatarFallback>Logo</AvatarFallback>
            </Avatar>
            <Typography variant={"secondary"}>Courses.</Typography>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="icon">
            <BellIcon></BellIcon>
          </Button>
          <Button variant="icon">
            <UserCircle></UserCircle>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="icon" aria-label="menuButton" onClick={() => setOpen(true)}>
                    <Avatar
                      className="h-8 w-8 cursor-pointer outline outline-primary/30 hover:outline-primary/70"
                    >
                      <AvatarImage
                        alt={session.data?.user.name || "NA"}
                        src={session.data?.user.image || ""} />
                      <AvatarFallback>{session.data?.user.name || "NA"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Profile Menu
                </TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2">
              <div className="flex flex-col p-2">
                <Typography
                  className="text-slate-700 font-medium"
                >
                  Account
                </Typography>
                <Typography color="GrayText">
                  {session.data?.user.name}
                </Typography>
              </div>
              <Separator></Separator>
              <Button onClick={() => signOut()} className="m-2 min-w-[10rem]">
                <Typography variant={"buttonText"}>Sign out</Typography>
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
