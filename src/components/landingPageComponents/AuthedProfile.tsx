import { DarkModeToggle } from "@/components/dark-mode-toggle"
import Spinner from "@/components/Spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Typography } from "@/components/ui/Typoghraphy"
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip"
import { getInitials } from "@/lib/getInitials"
import { cn } from "@/lib/utils"
import { hasPermission } from "@/server/permissions"
import { BookOpen, UserCog, LayoutDashboard } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

export const DesktopAuthenticatedProfileMenu = () => {
    const session = useSession()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleLogout = () => {
        setLoading(true)
        signOut({ callbackUrl: `/authentication` })
    }

    return (
        <div className="hidden lg:flex col-span-4 items-center gap-4 justify-end">
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
                <WrapWithTooltip text="Profile Menu">
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
                </WrapWithTooltip>
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

export const MobileAuthenticatedProfileMenu = () => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const session = useSession()

    const handleLogout = () => {
        setLoading(true)
        signOut({ callbackUrl: `/authentication` })
    }

    return (
        <div className="col-span-4 flex items-center gap-4 justify-end lg:hidden">
            <DropdownMenu open={open} onOpenChange={(value) => setOpen(value)}>
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
