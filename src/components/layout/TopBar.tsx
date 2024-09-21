import { signOut, useSession } from "next-auth/react";
import { useNavStore } from "@/zustand/store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { MenuIcon, UserCircle, MessagesSquare, FileCheck, ListChecks, CircleDollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Typography } from "../ui/Typoghraphy";
import { Separator } from "../ui/separator";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Spinner from "../Spinner";
import { DarkModeToggle } from "../dark-mode-toggle";
import Link from "next/link";
import Image from "next/image";
import { LogoForeground } from "@/components/layout/Logo";
import { SiteIdentity } from "@prisma/client";
import { getInitials } from "@/lib/getInitials";
import { api } from "@/lib/api";

export default function MegzTopBar({ siteIdentity }: { siteIdentity?: SiteIdentity }) {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setisMounted] = useState(false);
  const navStore = useNavStore((state) => state);
  const pathname = usePathname();

  const { data: trainerData } = api.trainers.getCurrentTrainer.useQuery(undefined, { enabled: session.data?.user.userType === "teacher" })

  const handlePathnameChange = useCallback(() => {
    if (navStore.opened) {
      navStore.closeNav();
    }
  }, [navStore.opened]);

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
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
          </Tooltip>
          <div className="col-span-6 flex items-center justify-center">
            <Link href={'/'} className="flex items-center gap-2 justify-center w-fit">
              {siteIdentity?.logoForeground ? (
                <Image src={siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-12 rounded-full' />
              ) : (
                <LogoForeground className="w-12 h-12" />
              )}
              <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                {siteIdentity?.name1 || "Megz"}
              </Typography>
              <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                {siteIdentity?.name2 || "Learning"}
              </Typography>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.data?.user.userType === "salesAgent" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/sales_operations`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <CircleDollarSign className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                Sales Operations
              </TooltipContent>
            </Tooltip>
          )}
          {session.data?.user.userType === "chatAgent" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/chats`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <MessagesSquare className="w-4 h-4"></MessagesSquare>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                My chats
              </TooltipContent>
            </Tooltip>
          )}
          {session.data?.user.userType === "teacher" && trainerData?.trainer?.role === "teacher" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/edu_team/my_sessions`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                My Sessions
              </TooltipContent>
            </Tooltip>
          ) : session.data?.user.userType === "teacher" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/edu_team/my_tasks`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                My Tasks
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/account`}>
                <Button variant="icon" customeColor={"primaryIcon"} >
                  <UserCircle className="w-4 h-4"></UserCircle>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              My Account
            </TooltipContent>
          </Tooltip>
          <DropdownMenu
            open={open}
            onOpenChange={(val) => setOpen(val)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                Profile Menu
              </TooltipContent>
            </Tooltip>
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
              <div className="p-2">
                <DarkModeToggle />
              </div>
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
