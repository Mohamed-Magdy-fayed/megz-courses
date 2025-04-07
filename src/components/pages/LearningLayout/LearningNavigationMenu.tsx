import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Course, Order, SiteIdentity } from "@prisma/client"
import Spinner from "@/components/ui/Spinner"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/Typoghraphy"
import { BookOpen, LayoutDashboard, LogIn, Menu, MenuIcon, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { LogoForeground } from "../adminLayout/Logo"
import { signOut, useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { DarkModeToggle } from "../../dark-mode-toggle"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavStore } from "@/zustand/store"
import Image from "next/image"
import { getInitials } from "@/lib/getInitials"
import { UserCog } from "lucide-react"
import { hasPermission } from "@/server/permissions"
import { DesktopUnauthenticatedProfileMenu, MobileUnauthenticatedProfileMenu } from "@/components/pages/landingPageComponents/NoAuthProfile"
import { DesktopAuthenticatedProfileMenu, MobileAuthenticatedProfileMenu } from "@/components/pages/landingPageComponents/AuthedProfile"

export const LearningNavigationMenu = ({ siteIdentity }: { siteIdentity?: SiteIdentity }) => {
    const latestCoursesQuery = api.courses.getLatest.useQuery(undefined, {
        enabled: false,
    })
    const editUserQuery = api.users.editUser.useMutation()
    const session = useSession()

    useEffect(() => {
        latestCoursesQuery.refetch()
    }, [])

    useEffect(() => {
        if (!session.data?.user) return
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const isTablet = /Tablet|iPad/i.test(navigator.userAgent);
        const getDevice = () => isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'

        if (session.data.user.device === (getDevice())) return
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
                {/* Logo and home link */}
                <div className="col-span-6 flex items-center justify-center">
                    <Link href={'/'} className="flex items-center gap-1 justify-center w-fit">
                        <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                            {siteIdentity?.name1 || "Gateling"}
                        </Typography>
                        {siteIdentity?.logoForeground ? (
                            <Image src={siteIdentity.logoForeground} height={1000} width={1000} alt="Logo" className='w-12 rounded-full' />
                        ) : (
                            <LogoForeground className="w-12 h-12" />
                        )}
                        <Typography variant={"primary"} className="!text-lg !leading-none !font-extrabold text-primary">
                            {siteIdentity?.name2 || "TMS"}
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
