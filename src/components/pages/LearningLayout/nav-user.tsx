"use client"

import {
    Bell,
    ChevronsUpDown,
    EyeIcon,
    EyeOffIcon,
    FilesIcon,
    LogOut,
    UserCog2Icon,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/getInitials"
import { api } from "@/lib/api"
import { DisplayError } from "@/components/ui/display-error"
import Link from "next/link"
import { Button, SpinnerButton } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useCallback, useState } from "react"
import { useNavStore } from "@/zustand/store"
import { useNotificationList } from "@/hooks/useNotificationList"
import { NotificationList } from "@/components/general/notifications/NotificationList"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Typography } from "@/components/ui/Typoghraphy"
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip"
import { SeverityPill } from "@/components/ui/SeverityPill"

export function NavUser() {
    const { isMobile } = useSidebar()

    const { data, isLoading, isError, error } = api.users.getCurrentUser.useQuery()

    const { unreadCount } = useNotificationList(5, "InApp");

    const trpcUtils = api.useUtils();
    const updateMutation = api.notifications.update.useMutation({
        onSuccess: () => trpcUtils.notifications.invalidate(),
    });
    const markAllMutation = api.notifications.markAllRead.useMutation({
        onSuccess: () => trpcUtils.notifications.invalidate(),
    });

    const changeStatus = useCallback((id: string, isRead: boolean) => {
        updateMutation.mutate({ id, data: { isRead } });
    }, [updateMutation]);

    const [loading, setLoading] = useState(false);
    const navStore = useNavStore((state) => state);

    const handleLogout = () => {
        setLoading(true)
        signOut({ callbackUrl: `/authentication` })
    }

    if (isLoading && !error) {
        return <Skeleton className="w-full h-12" />
    }

    if (isError && error) {
        return <DisplayError message={error.message} />
    }

    if (!data.user) {
        return <DisplayError message={`No data.user!`} />
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={data.user.image || ""} alt={data.user.name} />
                                <AvatarFallback className="rounded-lg">{getInitials(data.user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{data.user.name}</span>
                                <span className="truncate text-xs">{data.user.email}</span>
                            </div>
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
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={data.user.image || ""} alt={data.user.name} />
                                    <AvatarFallback className="rounded-lg">{getInitials(data.user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{data.user.name}</span>
                                    <span className="truncate text-xs">{data.user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href="/student/my_account">
                                    <UserCog2Icon />
                                    Account
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/student/my_courses">
                                    <FilesIcon />
                                    My Courses
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Bell />
                                    Notifications
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuGroup className="flex items-center">
                                            <DropdownMenuLabel>
                                                Notifications {!!unreadCount && <SeverityPill color="destructive" className="aspect-square inline-flex">{unreadCount}</SeverityPill>}
                                            </DropdownMenuLabel>
                                            {!!unreadCount && (
                                                <WrapWithTooltip text="Mark all as read">
                                                    <Button
                                                        onClick={() => markAllMutation.mutate({})}
                                                        className="ml-auto" variant="icon" customeColor="primaryIcon"
                                                    >
                                                        <EyeIcon className="size-4" />
                                                    </Button>
                                                </WrapWithTooltip>
                                            )}
                                        </DropdownMenuGroup>
                                        <NotificationList
                                            renderItem={(n) => (
                                                <DropdownMenuItem
                                                    key={n.id}
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        if (!n.isRead) changeStatus(n.id, true);
                                                    }}
                                                    className={cn(
                                                        'flex items-center justify-between w-full gap-4 hover:!bg-muted/10 hover:!text-foreground focus-visible:bg-muted/10 focus-visible:text-foreground',
                                                        !n.isRead && 'bg-info/10 text-foreground hover:!bg-info/20'
                                                    )}
                                                >
                                                    <div className="grid gap-1 max-w-md">
                                                        <Typography className="font-bold">{n.title}</Typography>
                                                        <Typography className="whitespace-pre-wrap truncate">{n.message}</Typography>
                                                        <Typography className="text-xs text-info">{formatDistanceToNow(new Date(n.createdAt))}</Typography>
                                                    </div>
                                                    {!n.isRead ? (
                                                        <WrapWithTooltip text="Mark as read">
                                                            <Button onClick={e => { e.stopPropagation(); changeStatus(n.id, true); }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                                                                <EyeOffIcon className="size-4" />
                                                            </Button>
                                                        </WrapWithTooltip>
                                                    ) : (
                                                        <WrapWithTooltip text="Mark as unread">
                                                            <Button onClick={e => { e.stopPropagation(); changeStatus(n.id, false); }} className="cursor-pointer pointer-events-auto" variant="icon" customeColor="success">
                                                                <EyeIcon className="size-4" />
                                                            </Button>
                                                        </WrapWithTooltip>
                                                    )}
                                                </DropdownMenuItem>
                                            )}
                                        />
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <SpinnerButton className="w-full" customeColor="destructiveOutlined" icon={LogOut} text="Log out" isLoading={loading} onClick={handleLogout} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
