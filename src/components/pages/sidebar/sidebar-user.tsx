"use client"

import {
    ChevronsUpDown,
    ListChecksIcon,
    LogOut,
    UserIcon,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import Link from "next/link"
import { useNotificationList } from "@/hooks/useNotificationList"
import { signOut, useSession } from "next-auth/react"
import { UserCard } from "@/components/ui/user-card"
import { ScreenShareIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function SidebarUser() {
    const { isMobile } = useSidebar()

    // Define menu items for each user role
    const userRoleMenuItems = [
        {
            roles: ["Admin"] as const,
            items: [
                {
                    text: "Leads",
                    href: "/admin/sales_management/leads",
                    icon: ListChecksIcon,
                },
                {
                    text: "Sessions",
                    href: "/admin/operations_management/sessions",
                    icon: ScreenShareIcon,
                },
            ],
        },
        {
            roles: ["SalesAgent"] as const,
            items: [
                {
                    text: "My leads",
                    href: "/admin/sales_management/leads/my_leads",
                    icon: ListChecksIcon,
                },
            ],
        },
        {
            roles: ["Teacher"] as const,
            items: [
                {
                    text: "My Sessions",
                    href: "/admin/users_management/edu_team/my_sessions",
                    icon: ScreenShareIcon,
                },
            ],
        },
        {
            roles: ["Tester"] as const,
            items: [
                {
                    text: "My Tasks",
                    href: "/admin/users_management/edu_team/my_tasks",
                    icon: ListChecksIcon,
                },
            ],
        },
    ];

    const user = useSession().data?.user
    if (!user) return <Skeleton className="w-full h-12" />

    const userRoles = user.userRoles || []

    // Helper to get menu items for current user roles
    function getMenuItemsForRoles() {
        return userRoleMenuItems
            .find(roleGroup => roleGroup.roles.some(role => userRoles.includes(role)))?.items || []
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group/user-card data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <UserCard />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <UserCard />
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <DarkModeToggle />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {/* Dynamic role-based items */}
                            {getMenuItemsForRoles().map((item, idx) => (
                                <DropdownMenuItem asChild key={item.text + idx}>
                                    <Link href={item.href}>
                                        <item.icon className="mr-2 w-4 h-4" />
                                        {item.text}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/authentication` })}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
