import { useEffect } from "react";

type PrefetchFn<TParams> = (params: TParams) => Promise<void>;

type UsePrefetchSurroundingPagesParams<TParams> = {
    dataCount?: number;
    pageIndex: number;
    pageSize: number;
    prefetchFn: PrefetchFn<TParams>;
} & Omit<TParams, "pageIndex" | "pageSize">;

/**
 * Prefetches the next and previous pages (one in each direction) when the page index changes.
 * Relies on React Query's caching mechanism to prevent duplicate requests.
 */
export function usePrefetchSurroundingPages<TParams>({
    dataCount,
    pageIndex,
    pageSize,
    prefetchFn,
    ...rest
}: UsePrefetchSurroundingPagesParams<TParams>) {
    useEffect(() => {
        if (!dataCount) return;

        const totalPages = Math.ceil(dataCount / pageSize);

        const nextPage = pageIndex + 1;
        const prevPage = pageIndex - 1;

        if (nextPage < totalPages) {
            prefetchFn({ pageIndex: nextPage, pageSize, ...rest } as TParams).catch((err) =>
                console.error(`Prefetch failed for page ${nextPage}:`, err)
            );
        }

        if (prevPage >= 0) {
            prefetchFn({ pageIndex: prevPage, pageSize, ...rest } as TParams).catch((err) =>
                console.error(`Prefetch failed for page ${prevPage}:`, err)
            );
        }
    }, [dataCount, pageIndex, pageSize, prefetchFn, rest]);
}
