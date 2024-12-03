import { signOut, useSession } from "next-auth/react";
import { useNavStore } from "@/zustand/store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { MenuIcon, UserCircle, MessagesSquare, ListChecks, CircleDollarSign, InfoIcon, BellRing, BellIcon, EyeOffIcon, EyeIcon, ScreenShareIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Typography } from "../ui/Typoghraphy";
import { Separator } from "../ui/separator";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Spinner from "../Spinner";
import { DarkModeToggle } from "../dark-mode-toggle";
import Link from "next/link";
import Image from "next/image";
import { LogoForeground } from "@/components/layout/Logo";
import { SiteIdentity, UserNoteStatus } from "@prisma/client";
import { getInitials } from "@/lib/getInitials";
import { api } from "@/lib/api";
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { SeverityPill } from "@/components/overview/SeverityPill";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MegzTopBar({ siteIdentity }: { siteIdentity?: SiteIdentity }) {
  const session = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setisMounted] = useState(false);
  const navStore = useNavStore((state) => state);
  const pathname = usePathname();

  const trpcUtils = api.useUtils()
  const { data } = api.notes.getActiveUserNotes.useQuery(undefined, { enabled: session.status === "authenticated" })
  const editNoteQuery = api.notes.editNoteStatus.useMutation({ onSettled: () => trpcUtils.notes.invalidate() })

  const changeStatus = (id: string, status: UserNoteStatus) => {
    editNoteQuery.mutate({ id, status })
  }

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
          {session.data?.user.userRoles.includes("SalesAgent")
            && session.data.user.userRoles.includes("Admin") ? (
            <WrapWithTooltip
              text="Leads"
              children={(
                <Link href={`/leads`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            />
          ) : (
            <WrapWithTooltip
              text="My leads"
              children={(
                <Link href={`/leads/my_leads`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            />
          )}
          {session.data?.user.userRoles.includes("ChatAgent")
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
          )}
          {session.data?.user.userRoles.includes("Admin")
            ? (
              <WrapWithTooltip text="Sessions">
                <Link href={`/edu_team/sessions`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ScreenShareIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </WrapWithTooltip>
            )
            : session.data?.user.userRoles.includes("Teacher") ? (
              <WrapWithTooltip text="My Sessions">
                <Link href={`/edu_team/my_sessions`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ScreenShareIcon className="w-4 h-4" />
                  </Button>
                </Link>
              </WrapWithTooltip>
            ) : session.data?.user.userRoles.includes("Tester") && (
              <WrapWithTooltip text="My Tasks">
                <Link href={`/edu_team/my_tasks`}>
                  <Button variant="icon" customeColor={"mutedIcon"} >
                    <ListChecks className="w-4 h-4" />
                  </Button>
                </Link>
              </WrapWithTooltip>
            )}
          {data?.notes && (
            <DropdownMenu>
              <WrapWithTooltip text="Notes that need your attention">
                <DropdownMenuTrigger className="relative mx-4">
                  {data.notes.filter(n => n.status !== "Closed").length > 0 && <InfoIcon className="absolute rounded-full text-destructive-foreground bg-destructive -top-2.5 -right-2.5 size-3" />}
                  {data.notes.filter(n => n.status !== "Closed").length > 0 ? <BellRing className="size-4" /> : <BellIcon className="size-4" />}
                </DropdownMenuTrigger>
              </WrapWithTooltip>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  Notes {data.notes.filter(n => n.status !== "Closed").length > 0 && <SeverityPill color="destructive" className="aspect-square inline-flex">{data?.notes.filter(n => n.status !== "Closed").length}</SeverityPill>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <ScrollArea className="max-h-96">
                    {data.notes.map(note => (
                      <DropdownMenuItem
                        key={note.id}
                        onClick={(e) => {
                          e.preventDefault()
                          note.status !== "Closed" && changeStatus(note.id, "Closed")
                          router.push(`/notes/${note.id}`)
                        }}
                        className={cn("flex items-center justify-between w-full gap-4 hover:!bg-muted/10 hover:!text-foreground focus-visible:bg-muted/10 focus-visible:text-foreground", note.status !== "Closed" && "bg-muted/10 text-foreground hover:!bg-muted/20")}
                      >
                        <div className="grid gap-4 max-w-md">
                          <Typography variant="secondary">
                            {note.title}
                          </Typography>
                          <Typography className="whitespace-pre-wrap truncate">
                            {note.messages[0]?.message}
                          </Typography>
                          <Typography className="text-xs text-info">
                            {format(note.updatedAt, "PPp")}
                          </Typography>
                        </div>
                        <WrapWithTooltip text={note.status !== "Closed" ? "Mark as seen!" : "Mark as not seen!"}>
                          <Button onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(note.id, note.status !== "Closed" ? "Closed" : "Opened")
                          }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                            {note.status !== "Closed"
                              ? (<EyeOffIcon className="size-4" />)
                              : (<EyeIcon className="size-4" />)}
                          </Button>
                        </WrapWithTooltip>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
