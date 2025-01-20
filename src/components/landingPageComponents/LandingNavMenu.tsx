import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Course, Order, SiteIdentity, UserNoteStatus } from "@prisma/client"
import Spinner from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { BellDot, BellRing, BookOpen, DotIcon, EyeIcon, EyeOffIcon, InfoIcon, LayoutDashboard, LogIn, Menu, StickyNote, UserCog, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { LogoForeground } from "../layout/Logo"
import { signOut, useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { DarkModeToggle } from "../dark-mode-toggle"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { ScrollArea } from "../ui/scroll-area"
import Image from "next/image"
import { getInitials } from "@/lib/getInitials"
import { SeverityPill } from "@/components/overview/SeverityPill"
import { BellIcon } from "lucide-react"
import { useRouter } from "next/router"
import { format } from "date-fns"
import { hasPermission } from "@/server/permissions"

export const LandingNavigationMenu = ({ siteIdentity }: { siteIdentity?: SiteIdentity }) => {
  const session = useSession()
  const router = useRouter()
  const latestCoursesQuery = api.courses.getLatest.useQuery(undefined, {
    enabled: false,
  })
  const trpcUtils = api.useUtils()
  const { data } = api.notes.getActiveUserNotes.useQuery(undefined, { enabled: session.status === "authenticated" })
  const editNoteQuery = api.notes.editNoteStatus.useMutation({ onSettled: () => trpcUtils.notes.invalidate() })
  const editUserQuery = api.users.editUser.useMutation()

  const changeStatus = (id: string, status: UserNoteStatus) => {
    editNoteQuery.mutate({ id, status })
  }

  useEffect(() => {
    latestCoursesQuery.refetch()
  }, [])

  useEffect(() => {
    if (!session.data?.user) return
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /Tablet|iPad/i.test(navigator.userAgent);
    const getDevice = () => isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'

    if (session.data.user.device === (getDevice()) || !session.data.user.emailVerified) return
    editUserQuery.mutate({
      id: session.data?.user.id || "",
      name: session.data?.user.name || "",
      email: session.data?.user.email || "",
      device: getDevice(),
    })
  }, [session.data?.user])

  return (
    <div className="w-full z-10 py-2 px-4 md:px-8 md:py-4 max-w-7xl lg:mx-auto">
      <div className="grid items-center grid-cols-12 border-b border-primary">
        <DesktopNavMenu courses={latestCoursesQuery.data?.courses} />
        {/* Logo and home link */}
        <div className="col-span-6 flex items-center justify-center">
          <Link href={'/'} className="flex items-center gap-1 justify-center w-fit">
            <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
              {siteIdentity?.name1 || "Gateling"}
            </Typography>
            {siteIdentity ? (
              <Image src={siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-12 rounded-full' />
            ) : (
              <LogoForeground className="w-12 h-12" />
            )}
            <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
              {siteIdentity?.name2 || "TMS"}
            </Typography>
          </Link>
        </div>

        <div className="flex col-span-3 items-center gap-4 justify-end">
          {data?.notes && (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative mx-4">
                {data.notes.filter(n => n.status !== "Closed").length > 0 && <InfoIcon className="absolute rounded-full text-destructive-foreground bg-destructive -top-2.5 -right-2.5 size-3" />}
                {data.notes.filter(n => n.status !== "Closed").length > 0 ? <BellRing className="size-4" /> : <BellIcon className="size-4" />}
              </DropdownMenuTrigger>
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
                        }}
                        className={cn("flex items-center justify-between w-full gap-4 hover:!bg-muted/10 hover:!text-foreground focus-visible:bg-muted/10 focus-visible:text-foreground", note.status !== "Closed" && "bg-primary/10 text-foreground hover:!bg-primary/20")}
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
                        {note.status !== "Closed" ? (
                          <Button onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(note.id, "Closed")
                          }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                            <EyeOffIcon className="size-4" />
                          </Button>
                        ) : (
                          <Button onClick={(e) => {
                            e.stopPropagation()
                            changeStatus(note.id, "Opened")
                          }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                            <EyeIcon className="size-4" />
                          </Button>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!session.data?.user && session.status !== "authenticated" ? (
            <>
              <MobileUnauthenticatedProfileMenu />
              <DesktopUnauthenticatedProfileMenu />
            </>
          ) : (
            <>
              <MobileAuthenticatedProfileMenu />
              <DesktopAuthenticatedProfileMenu />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const DesktopNavMenu = ({ courses }: {
  courses: (Course & {
    orders: Order[]
  })[] | undefined
}) => {
  return (
    <NavigationMenu className="col-span-3">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="hover:bg-primary/20 bg-transparent">
            Courses
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ScrollArea className="max-h-96 flex flex-col gap-2">
              {!courses ? <Spinner /> : courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className=" whitespace-nowrap border-b border-muted"
                >
                  <div className="py-2 px-4 hover:bg-primary/20">
                    <Typography className="" variant={"secondary"}>{course.name}</Typography>
                    <Typography className="whitespace-nowrap">
                      {course.orders.length} Enrollments
                    </Typography>
                  </div>
                </Link>
              ))}
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const DesktopUnauthenticatedProfileMenu = () => {

  return (
    <div className="hidden md:flex col-span-3 items-center gap-4 justify-end">
      <Link href={`/authentication?variant=login`}>
        <Button customeColor={"successIcon"}>
          <Typography className="text-foreground">Login</Typography>
          <LogIn />
        </Button>
      </Link>
      <Link href={`/authentication?variant=register`}>
        <Button customeColor={"primaryIcon"}>
          <Typography className="text-foreground">Register</Typography>
          <UserPlus />
        </Button>
      </Link>
    </div>
  )
}

const MobileUnauthenticatedProfileMenu = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden flex col-span-3 items-center gap-4 justify-end">
      <DropdownMenu
        open={open}
        onOpenChange={(val) => setOpen(val)}
      >
        <DropdownMenuTrigger asChild>
          <Button variant={"icon"} customeColor={"primaryIcon"}>
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="md:hidden flex flex-col gap-4">
          <Link href={`/authentication?variant=login`}>
            <Button customeColor={"successIcon"} className="w-full justify-start">
              <Typography className="text-foreground">Login</Typography>
              <LogIn />
            </Button>
          </Link>
          <Link href={`/authentication?variant=register`}>
            <Button customeColor={"primaryIcon"} className="w-full justify-start">
              <Typography className="text-foreground">Register</Typography>
              <UserPlus />
            </Button>
          </Link>
          <DropdownMenuSeparator className="md:hidden" />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const DesktopAuthenticatedProfileMenu = () => {
  const session = useSession()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    setLoading(true)
    signOut({ callbackUrl: `/authentication` })
  }

  return (
    <div className="hidden lg:flex col-span-3 items-center gap-4 justify-end">
      {/* Authenticated Users (Students) */}
      {session.data?.user && !hasPermission(session.data.user, "adminLayout", "view") ? (
        <>
          <Link href={`/my_courses`}>
            <Button customeColor={"primaryIcon"}>
              <Typography className="text-foreground whitespace-nowrap">My courses</Typography>
              <BookOpen />
            </Button>
          </Link>
          <Link href={`/my_account`}>
            <Button customeColor={"primaryIcon"}>
              <Typography className="text-foreground whitespace-nowrap">My Account</Typography>
              <UserCog />
            </Button>
          </Link>
        </>
      ) /* Authenticated Users (non Student) */ : (
        <Link href={`/dashboard`}>
          <Button customeColor={"primaryIcon"}>
            <Typography className="text-foreground whitespace-nowrap">Dashboard</Typography>
            <LayoutDashboard />
          </Button>
        </Link>
      )}
      <DropdownMenu open={open} onOpenChange={(value) => setOpen(value)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="icon" aria-label="menuButton" onClick={() => setOpen(true)}>
                <Avatar
                  className="h-8 w-8 cursor-pointer outline outline-primary/30 hover:outline-primary/70"
                >
                  <AvatarImage
                    alt={getInitials(session.data?.user.name || "")}
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
        <DropdownMenuContent className="p-2 hidden md:block">
          <div className="flex flex-col p-2">
            <Typography
              className="text-slate-700 font-medium"
            >
              User Name
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
          <Button customeColor={"primaryIcon"} disabled={loading} onClick={handleLogout} className="m-2 min-w-[10rem] relative">
            {loading && <Spinner className="w-6 h-6 absolute" />}
            <Typography className={cn(loading && "opacity-0")} variant={"buttonText"}>Sign out</Typography>
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const MobileAuthenticatedProfileMenu = () => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const session = useSession()

  const handleLogout = () => {
    setLoading(true)
    signOut({ callbackUrl: `/authentication` })
  }

  return (
    <div className="col-span-3 flex items-center gap-4 justify-end lg:hidden">
      <DropdownMenu open={open} onOpenChange={(value) => setOpen(value)}>
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
        <DropdownMenuContent className="p-2 lg:hidden">
          <div className="flex flex-col p-2">
            <Typography
              className="text-slate-700 font-medium"
            >
              User Name
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
          <div className="flex flex-col gap-2">
            {session.data?.user && !hasPermission(session.data.user, "adminLayout", "view") ? (
              <>
                <Link href={`/my_courses`}>
                  <Button customeColor={"primaryIcon"} className="w-full">
                    <Typography className="text-foreground">My courses</Typography>
                    <BookOpen />
                  </Button>
                </Link>
                <Link href={`/my_account`}>
                  <Button customeColor={"primaryIcon"} className="w-full">
                    <Typography className="text-foreground">My Account</Typography>
                    <UserCog />
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={`/dashboard`}>
                <Button customeColor={"primaryIcon"} className="w-full my-2">
                  <Typography className="text-foreground">Dashboard</Typography>
                  <LayoutDashboard />
                </Button>
              </Link>
            )}
          </div>
          <DropdownMenuSeparator className="md:hidden" />
          <Button customeColor={"primaryIcon"} disabled={loading} onClick={handleLogout} className="m-2 min-w-[10rem] relative">
            {loading && <Spinner className="w-6 h-6 absolute" />}
            <Typography className={cn(loading && "opacity-0")} variant={"buttonText"}>Sign out</Typography>
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
