import { api } from '@/lib/api';
import { NotificationChannel } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useNotificationList(pageSize: number = 20, channel?: NotificationChannel) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.notifications.getByChannel.useInfiniteQuery(
    { limit: pageSize },
    {
      enabled: !!userId,
      getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    }
  );
  const { data: unreadCount } = api.notifications.getUnreadCount.useQuery({})

  const notifications = useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.items) : []),
    [data]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    fetchNext: fetchNextPage,
    hasMore: !!hasNextPage,
    isFetchingMore: isFetchingNextPage,
    refetch,
  };
}
