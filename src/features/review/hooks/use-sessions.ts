import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getSessions } from "../api/get-sessions";
import { reviewKeys, type SessionsQueryKey } from "../api/review-keys";
import { SessionsQuery, SessionsResponseDto } from "../types";

export function useSessionsQuery(
    filters: SessionsQuery = {},
    options?: Omit<
        UseQueryOptions<
            SessionsResponseDto,
            Error,
            SessionsResponseDto,
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
            ) as SessionsQueryKey,
            queryFn: async () => {
                const response = await getSessions(filters);
                return response; 
            },
            ...options,
            enabled: baseEnabled && (options?.enabled ?? true),
            placeholderData: (prev) => prev,

        }
    );
}
