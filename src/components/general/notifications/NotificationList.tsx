// NotificationList.tsx
import { useNotificationList } from '../../../hooks/useNotificationList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DisplayError } from '@/components/ui/display-error';
import { Typography } from '@/components/ui/Typoghraphy';
import { formatDistanceToNow } from 'date-fns';
import Spinner from '@/components/ui/Spinner';
import { useRef, UIEvent } from 'react';

export function NotificationList({ renderItem }: { renderItem?: (n: any) => React.ReactNode }) {
    const { notifications, isLoading, isError, fetchNext, hasMore, isFetchingMore } = useNotificationList();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Handler to detect scroll near bottom
    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;

        if (!hasMore || isFetchingMore) return;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 64) {
            fetchNext();
        }
    };

    if (isLoading) return <Spinner className="w-full h-20" />;
    if (isError) return <DisplayError message="Failed to load notifications" />;

    return (
        <ScrollArea
            className="h-96 w-full pr-2"
            ref={scrollRef}
            style={{ minHeight: '100%' }}
            onScroll={handleScroll}
        >
            {notifications.length === 0 && (
                <Typography className="text-center text-destructive">No notifications</Typography>
            )}
            {notifications.map((n) =>
                renderItem ? renderItem(n) : (
                    <div key={n.id} className="flex flex-col gap-1 p-3">
                        <Typography className="font-semibold">{n.title}</Typography>
                        <Typography className="text-sm text-muted-foreground">{n.message}</Typography>
                        <Typography className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(n.createdAt))} ago
                        </Typography>
                    </div>
                )
            )}
            {isFetchingMore && <Spinner className="mx-auto" />}
        </ScrollArea>
    );
}
