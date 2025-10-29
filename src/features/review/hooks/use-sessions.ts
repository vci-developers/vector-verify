import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getSessions } from "../api/get-sessions";
import { reviewKeys, type SessionsQueryKey } from "../api/review-keys";
import type { Session } from "@/shared/entities/session/model";
import { SessionsQuery } from "../types";
import { DEFAULT_PAGE_SIZE } from "@/shared/entities/pagination";

export function useSessionsQuery(
    filters: SessionsQuery = {},
    options?: Omit<
        UseQueryOptions<
            Session[],
            Error,
            Session[],
            SessionsQueryKey
        >,
        "queryKey" | "queryFn"
    >,
) {
    const {
        district,
        startDate,
        endDate,
    } = filters;

    const baseEnabled = Boolean(district && startDate && endDate);
    return useQuery(
        {
            queryKey: reviewKeys.sessions(
                filters.district,
                filters.startDate,
                filters.endDate,
                filters.limit
            ) as SessionsQueryKey,
            queryFn: async () => {
                const response = await getSessions(filters);
                return response.sessions; 
            },
            ...options,
            enabled: baseEnabled && (options?.enabled ?? true),
        }
    );
}
