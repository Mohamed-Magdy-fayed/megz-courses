import { useCallback } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { InfoIcon, BellRing, BellIcon, EyeOffIcon, EyeIcon } from 'lucide-react';
import { SeverityPill } from '@/components/ui/SeverityPill';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/Typoghraphy';
import { NotificationList } from '@/components/general/notifications/NotificationList';
import { useNotificationList } from '@/hooks/useNotificationList';
import { api } from '@/lib/api';
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";

export function NotificationDropdown() {
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="relative mx-4">
                {!!unreadCount && <InfoIcon className="absolute rounded-full text-destructive-foreground bg-destructive -top-2.5 -right-2.5 size-3" />}
                {!!unreadCount ? <BellRing className="size-4" /> : <BellIcon className="size-4" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup className="flex items-center">
                    <DropdownMenuLabel>
                        Notifications {!!unreadCount && <SeverityPill color="destructive" className="aspect-square inline-flex">{unreadCount}</SeverityPill>}
                    </DropdownMenuLabel>
                    {!!unreadCount && (
                        <WrapWithTooltip text="Mark all as read">
                            <Button
                                onClick={e => markAllMutation.mutate({})}
                                className="ml-auto" variant="icon" customeColor="primaryIcon"
                            >
                                <EyeIcon className="size-4" />
                            </Button>
                        </WrapWithTooltip>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <div className="max-h-96 min-w-[320px]">
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
                    </div>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
