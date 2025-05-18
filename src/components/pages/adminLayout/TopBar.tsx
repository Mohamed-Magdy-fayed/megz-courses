import { signOut, useSession } from "next-auth/react";
import { useNavStore } from "@/zustand/store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { MenuIcon, UserCircle, MessagesSquare, ListChecks, CircleDollarSign, InfoIcon, BellRing, BellIcon, EyeOffIcon, EyeIcon, ScreenShareIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/Typoghraphy";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/ui/Spinner";
import { DarkModeToggle } from "../../dark-mode-toggle";
import Link from "next/link";
import Image from "next/image";
import { LogoForeground } from "@/components/pages/adminLayout/Logo";
import { SiteIdentity, UserNoteStatus } from "@prisma/client";
import { getInitials } from "@/lib/getInitials";
import { api } from "@/lib/api";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { SeverityPill } from "@/components/ui/SeverityPill";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationDropdown } from "@/components/general/notifications/NotificationDropdown";

export default function MegzTopBar({ siteIdentity }: { siteIdentity?: SiteIdentity }) {
  const session = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setisMounted] = useState(false);
  const navStore = useNavStore((state) => state);
  const pathname = usePathname();

  const handlePathnameChange = useCallback(() => {
    if (navStore.Opened) {
      navStore.closeNav();
    }
  }, [navStore.Opened]);

  const handleLogout = () => {
    setLoading(true)
    signOut({ callbackUrl: `/authentication` })
  }

  useEffect(() => {
    if (!isMounted) setisMounted(true)
  }, []);

  useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );

  if (!isMounted) return <Skeleton className="w-full h-full"></Skeleton>

  return (
    <div
      className={`relative z-50 isolate top-0 !bg-background/80 !shadow-none !backdrop-blur-sm`}
    >
      <div className="flex justify-between p-2">
        <div className="flex items-center gap-2">
          <WrapWithTooltip text="Menu">
            <Button
              variant="icon"
              customeColor={"foregroundIcon"}
              className={cn("lg:!hidden")}
              onClick={() => {
                navStore.openNav();
              }}
            >
              <MenuIcon className="w-4 h-4" />
            </Button>
          </WrapWithTooltip>
          <div className="col-span-6 flex items-center justify-center">
            <Link href={'/'} className="flex items-center gap-2 justify-center w-fit">
              {siteIdentity?.logoForeground ? (
                <Image src={siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-12 rounded-full' />
              ) : (
                <LogoForeground className="w-12 h-12" />
              )}
              <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                {siteIdentity?.name1 || "Gateling"}
              </Typography>
              <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                {siteIdentity?.name2 || "TMS"}
              </Typography>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.data?.user.userRoles.includes("Admin") ? (
            <WrapWithTooltip
              text="Leads"
              children={(
                <Link href={`/admin/sales_management/leads`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            />
          ) : session.data?.user.userRoles.includes("SalesAgent") ? (
            <WrapWithTooltip
              text="My leads"
              children={(
                <Link href={`/admin/sales_management/leads/my_leads`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            />
          ) : null}
          {/* {session.data?.user.userRoles.includes("ChatAgent")
            && session.data.user.userRoles.includes("Admin") ? (
            <WrapWithTooltip text="Chats">
              <Link href={`/chats`}>
                <Button variant="icon" customeColor={"mutedIcon"} >
                  <MessagesSquare className="w-4 h-4" />
                </Button>
              </Link>
            </WrapWithTooltip>
          ) : (
            <WrapWithTooltip text="My chats">
              <Link href={`/chats`}>
                <Button variant="icon" customeColor={"mutedIcon"} >
                  <MessagesSquare className="w-4 h-4" />
                </Button>
              </Link>
            </WrapWithTooltip>
          )} */}
          {session.data?.user.userRoles.includes("Admin")
            ? (
              <WrapWithTooltip text="Sessions">
                <Link href={`/admin/operations_management/sessions`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ScreenShareIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </WrapWithTooltip>
            )
            : session.data?.user.userRoles.includes("Teacher") ? (
              <WrapWithTooltip text="My Sessions">
                <Link href={`/admin/users_management/edu_team/my_sessions`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ScreenShareIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </WrapWithTooltip>
            ) : session.data?.user.userRoles.includes("Tester") && (
              <WrapWithTooltip text="My Tasks">
                <Link href={`/admin/users_management/edu_team/my_tasks`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              </WrapWithTooltip>
            )}

          {/* Notification Dropdown using NotificationList */}
          <NotificationDropdown />

          <WrapWithTooltip text="My Account">
            <Link href={`/admin/users_management/account`}>
              <Button variant="icon" customeColor={"primaryIcon"} >
                <UserCircle className="w-4 h-4"></UserCircle>
              </Button>
            </Link>
          </WrapWithTooltip>
          <DropdownMenu
            open={open}
            onOpenChange={(val) => setOpen(val)}
          >
            <WrapWithTooltip text="Profile Menu">
              <DropdownMenuTrigger asChild>
                <Button variant="icon" aria-label="menuButton" onClick={() => setOpen(true)}>
                  <Avatar
                    className="h-8 w-8 cursor-pointer outline outline-primary/30 hover:outline-primary/70"
                  >
                    <AvatarImage
                      alt={session.data?.user.name || "NA"}
                      src={session.data?.user.image || ""} />
                    <AvatarFallback>{getInitials(session.data?.user.name || "NA")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </WrapWithTooltip>
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
              {/* <Separator></Separator>
              <div className="p-2">
                <DarkModeToggle />
              </div> */}
              <Separator></Separator>
              <Button disabled={loading} onClick={handleLogout} className="m-2 min-w-[10rem] relative">
                {loading && <Spinner className="w-6 h-6 absolute" />}
                <Typography className={cn(loading && "opacity-0")} variant={"buttonText"}>Sign out</Typography>
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
