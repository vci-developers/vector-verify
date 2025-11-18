import { useQuery, useInfiniteQuery, type UseQueryOptions, type UseInfiniteQueryOptions } from "@tanstack/react-query";
import { getSessions } from "../api/get-sessions";
import { reviewKeys, type SessionsQueryKey } from "../api/review-keys";
import { SessionsQuery } from "../types";
import { OffsetPage } from "@/shared/entities/pagination/model";
import { Session } from "@/shared/entities/session/model";
import { DEFAULT_PAGE_SIZE } from "@/shared/entities/pagination";

export function useSessionsQuery(
    filters: SessionsQuery = {},
    options?: Omit<
        UseQueryOptions<
            OffsetPage<Session>,
            Error,
            OffsetPage<Session>,    
            SessionsQueryKey
        >,
        "queryKey" | "queryFn"
    >,
) {
    const {
        district,
        startDate,
        endDate,
        limit,
        offset,
        sortBy,
        sortOrder,
        type, // Type defaults to SURVEILLANCE in getSessions() API layer
    } = filters;

    const baseEnabled = Boolean(district && startDate && endDate);
    
    // Use the type from filters, or it will default to SURVEILLANCE in API layer
    const sessionType = type ?? 'SURVEILLANCE';

    return useQuery(
        {
            queryKey: reviewKeys.sessions(
                district,
                startDate,
                endDate,
                limit,
                offset,
                sortBy,
                sortOrder,
                sessionType, // Include in query key for proper cache invalidation
            ) as SessionsQueryKey,
            queryFn: async () => {
                const response = await getSessions(filters);
                return {
                    items: response.items,
                    total: response.total,
                    limit: response.limit,
                    offset: response.offset,
                    hasMore: response.hasMore,
                } as OffsetPage<Session>;
            },
            ...options,
            enabled: baseEnabled && (options?.enabled ?? true),
            placeholderData: (prev) => prev,
        }
    );
}

export function useSessionsInfiniteQuery(
    filters: SessionsQuery = {},
    options?: Omit<
        UseInfiniteQueryOptions<
            OffsetPage<Session>,
            Error,
            OffsetPage<Session>,
            OffsetPage<Session>,
            SessionsQueryKey,
            number
        >,
        "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
    >,
) {
    const {
        district,
        startDate,
        endDate,
        limit = DEFAULT_PAGE_SIZE,
        sortBy,
        sortOrder,
        type, // Type defaults to SURVEILLANCE in getSessions() API layer
    } = filters;

    const baseEnabled = Boolean(district && startDate && endDate);
    
    // Use the type from filters, or it will default to SURVEILLANCE in API layer
    const sessionType = type ?? 'SURVEILLANCE';

    return useInfiniteQuery({
        queryKey: reviewKeys.sessions(
            district,
            startDate,
            endDate,
            limit,
            undefined, // offset is handled by pageParam
            sortBy,
            sortOrder,
            sessionType, // Include in query key for proper cache invalidation
        ) as SessionsQueryKey,
        queryFn: async ({ pageParam = 0 }) => {
            const response = await getSessions({
                ...filters,
                limit,
                offset: pageParam,
            });
            return {
                items: response.items,
                total: response.total,
                limit: response.limit,
                offset: response.offset,
                hasMore: response.hasMore,
            } as OffsetPage<Session>;
        },
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce(
                (sum, page) => sum + (page.items?.length ?? 0),
                0
            );
            return loaded < (lastPage.total ?? 0) ? loaded : undefined;
        },
        initialPageParam: 0,
        enabled: baseEnabled && (options?.enabled ?? true),
        ...options,
    });
}
