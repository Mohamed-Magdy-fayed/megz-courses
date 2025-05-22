import { api } from '@/lib/api';
import { useMemo } from 'react';

export function useDiscussionMessages(discussionId?: string, pageSize: number = 20) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch, } = api.discussions.getMessages.useInfiniteQuery(
      {
        discussionId: discussionId!,
        limit: pageSize
      },
      {
        enabled: !!discussionId,
        getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined
      }
    );

  const messages = useMemo(
    () => (data?.pages ? data.pages.flatMap((page) => page.items) : []),
    [data]
  );

  return {
    messages,
    isLoading,
    isError,
    fetchNext: fetchNextPage,
    hasMore: !!hasNextPage,
    isFetchingMore: isFetchingNextPage,
    refetch,
  };
}
