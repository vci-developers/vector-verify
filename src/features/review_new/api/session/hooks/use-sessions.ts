import type { Result } from '@/lib/result/result';
import {
    getSessionsQueryParamsSchema,
    type GetSessionsQueryParams,
    type GetSessionsSuccessPayload,
} from '@/features/review_new/api/session/validation/get-sessions-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery } from '@tanstack/react-query';
import { sessionKeys } from '@/features/review_new/api/session/session-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

async function fetchSessions(
    queryParams?: GetSessionsQueryParams,
): Promise<Result<GetSessionsSuccessPayload, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getSessionsQueryParamsSchema,
    );

    const response = await fetch(`/api/sessions${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const sessionsResult: Result<GetSessionsSuccessPayload, NetworkError> =
        await response.json();
    return sessionsResult;
}

export function useSessions(queryParams?: GetSessionsQueryParams) {
    return useQuery({
        queryKey: sessionKeys.sessions(queryParams),
        queryFn: () => fetchSessions(queryParams),
    });
}
