"use client"

import React, { useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { EyeIcon, CheckIcon } from 'lucide-react';
import { Typography } from '@/components/ui/Typoghraphy';
import { useNotificationList } from '@/hooks/useNotificationList';
import WrapWithTooltip from "@/components/ui/wrap-with-tooltip";
import { formatDistanceToNow } from 'date-fns';
import { XIcon } from 'lucide-react';

export const NotificationsSheet = ({
    isOpen,
    setIsOpen,
}: { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const {
        unreadCount,
        markAllMutation,
        changeStatus,
        notifications,
        isLoading,
        isFetchingMore,
        hasMore,
        fetchNext,
    } = useNotificationList();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Infinite scroll handler
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (!hasMore || isFetchingMore) return;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 64) {
            fetchNext();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen} modal>
            <SheetContent className="max-w-md w-full p-0 flex flex-col">
                <SheetHeader className="p-6 pb-2 border-b">
                    <SheetTitle>
                        Notifications
                        {!!unreadCount && (
                            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5">
                                {unreadCount}
                            </span>
                        )}
                    </SheetTitle>
                    {!!unreadCount && (
                        <Button
                            onClick={() => markAllMutation.mutate({})}
                            variant="outline"
                            customeColor="primaryOutlined"
                            size="sm"
                            className="gap-1"
                        >
                            <EyeIcon className="size-4" />
                            Mark all as read
                        </Button>
                    )}
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-0 py-4" ref={scrollRef} onScroll={handleScroll}>
                    <div className="flex justify-end mb-2 px-6 sticky top-0 z-50">

                    </div>
                    {isLoading ? (
                        <Typography className="text-center text-muted-foreground">Loading...</Typography>
                    ) : notifications.length === 0 ? (
                        <Typography className="text-center text-destructive">No notifications</Typography>
                    ) : (
                        <ul className="divide-y divide-border">
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className={`flex items-center px-0 sm:px-6 py-4 group transition-colors relative ${!n.isRead
                                        ? "bg-primary/10 text-foreground"
                                        : "bg-background text-foreground"
                                        }`}
                                >
                                    {/* Left accent bar for unread */}
                                    {!n.isRead && (
                                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                                    )}
                                    <div className="flex-1 pl-4 space-x-2">
                                        <Typography className="font-semibold">{n.title}</Typography>
                                        <Typography className="text-sm">{n.message}</Typography>
                                        <Typography className="text-xs text-info mt-1">{formatDistanceToNow(new Date(n.createdAt))} ago</Typography>
                                    </div>
                                    <WrapWithTooltip text={!n.isRead ? "Mark as read" : "Mark as unread"}>
                                        <Button
                                            variant="icon"
                                            customeColor="primaryIcon"
                                            onClick={() => changeStatus(n.id, !n.isRead)}
                                            aria-label={n.isRead ? "Mark as unread" : "Mark as read"}
                                            className="ml-2 opacity-70 group-hover:opacity-100"
                                        >
                                            {!n.isRead ? (
                                                <CheckIcon className="w-5 h-5 text-primary" />
                                            ) : (
                                                <XIcon className="w-5 h-5 text-primary" />
                                            )}
                                        </Button>
                                    </WrapWithTooltip>
                                </li>
                            ))}
                            {isFetchingMore && (
                                <Typography className="text-center text-muted-foreground mt-4">Loading more...</Typography>
                            )}
                        </ul>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};