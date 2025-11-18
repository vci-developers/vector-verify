import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getSessions } from "../api/get-sessions";
import { reviewKeys, type SessionsQueryKey } from "../api/review-keys";
import { SessionsQuery } from "../types";
import { OffsetPage } from "@/shared/entities/pagination/model";
import { Session } from "@/shared/entities/session/model";

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
    } = filters;

    const baseEnabled = Boolean(district && startDate && endDate);
    return useQuery(
        {
            queryKey: reviewKeys.sessions(
                district,
                startDate,
                endDate,
                limit,
                offset,
                filters.sortBy,
                filters.sortOrder,
                'SURVEILLANCE',
            ) as SessionsQueryKey,
            queryFn: async () => {
                const response = await getSessions({
                    ...filters,
                    type: 'SURVEILLANCE',
                });
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
