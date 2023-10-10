import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Order, Prisma } from "@prisma/client"
import Spinner from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { BookOpen, LayoutDashboard, LogIn, Menu, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FC, useState } from "react"
import { LogoForeground } from "../layout/Logo"
import { signOut, useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { DarkModeToggle } from "../dark-mode-toggle"
import { cn } from "@/lib/utils"

interface LandingNavigationMenuProps {
  data: {
    courses: {
      name: string;
      id: string;
      updatedAt: Date;
      createdAt: Date;
      orders: Order[];
      price: number;
      _count: Prisma.CourseCountOutputType;
    }[];
  } | undefined
}

export const LandingNavigationMenu: React.FC<LandingNavigationMenuProps> = ({
  data,
}) => {
  const session = useSession()

  return (
    <div className="w-full z-10 py-2 px-4 md:px-8 md:py-4 max-w-7xl lg:mx-auto">
      <div className="grid items-center grid-cols-12 border-b border-primary">
        <DesktopNavMenu data={data} />
        {/* Logo and home link */}
        <div className="col-span-6 flex items-center justify-center">
          <Link href={'/'} className="flex items-center gap-1 justify-center w-fit">
            <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
              Megz
            </Typography>
            <LogoForeground className="w-12 h-12" />
            <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
              Learning
            </Typography>
          </Link>
        </div>
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
  )
}

const DesktopNavMenu: FC<LandingNavigationMenuProps> = ({ data }) => {
  return (
    <NavigationMenu className="col-span-3">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="hover:bg-primary/20 bg-transparent">
            Courses
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex flex-col items-start p-0">
              {!data?.courses ? <Spinner /> : data.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="hover:bg-primary whitespace-nowrap w-full transition-colors hover:text-primary-foreground p-4"
                >
                  <Typography variant={"secondary"}>{course.name}</Typography>
                  <p className="whitespace-nowrap">
                    {course.orders.length} Enrollments
                  </p>
                </Link>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:inline-flex">
          <NavigationMenuTrigger className="hover:bg-primary/20 bg-transparent">
            Careers
          </NavigationMenuTrigger>
          <NavigationMenuContent className="hidden md:inline-block">
            <ul className="flex flex-col items-start p-0">
              {["Join as a teacher", "Join as a sales agent", "Join as a project manager"].map((item) => (
                <Link
                  key={item}
                  href={`/careers/${item}`}
                  className="hover:bg-primary whitespace-nowrap w-full transition-colors hover:text-primary-foreground p-4"
                >
                  <Typography variant={"secondary"}>{item}</Typography>
                </Link>
              ))}
            </ul>
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
          <MobileNavMenu />
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
    signOut()
  }

  return (
    <div className="hidden md:flex col-span-3 items-center gap-4 justify-end">
      {/* Authenticated Users (Students) */}
      {session.data?.user.userType === "student" ? (
        <Link href={`/courses/${session.data?.user.id}`}>
          <Button customeColor={"primaryIcon"}>
            <Typography className="text-foreground whitespace-nowrap">My courses</Typography>
            <BookOpen />
          </Button>
        </Link>
      ) /* Authenticated Users (non student) */ : (
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
                    alt={session.data?.user.name || "NA"}
                    src={session.data?.user.image || ""} />
                  <AvatarFallback>{session.data?.user.name || "NA"}</AvatarFallback>
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
    signOut()
  }

  return (
    <div className="col-span-3 flex items-center gap-4 justify-end md:hidden">
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
                  <AvatarFallback>{session.data?.user.name || "NA"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Profile Menu
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="p-2 md:hidden">
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
          {session.data?.user.userType === "student" ? (
            <Link href={`/courses/${session.data?.user.id}`}>
              <Button customeColor={"primaryIcon"} className="w-full my-2">
                <Typography className="text-foreground">My courses</Typography>
                <BookOpen />
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard`}>
              <Button customeColor={"primaryIcon"} className="w-full my-2">
                <Typography className="text-foreground">Dashboard</Typography>
                <LayoutDashboard />
              </Button>
            </Link>
          )}
          <DropdownMenuSeparator className="md:hidden" />
          <MobileNavMenu />
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

const MobileNavMenu = () => {

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="md:hidden p-4">
        Careers
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="md:hidden">
        <ul className="flex flex-col items-start p-0">
          {["Join as a teacher", "Join as a sales agent", "Join as a project manager"].map((item) => (
            <Link
              key={item}
              href={`/careers/${item}`}
              className="hover:bg-primary/20 whitespace-nowrap w-full transition-colors p-4"
            >
              <Typography variant={"secondary"}>{item}</Typography>
            </Link>
          ))}
        </ul>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}