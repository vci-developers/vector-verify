import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import {
    useQueries,
    useQuery,
    type UseQueryOptions,
} from '@tanstack/react-query';
import type { GetSurveillanceFormBySessionIdSuccessPayload } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import { surveillanceFormKeys } from '../surveillance-form-keys';

type GetSurveillanceFormBySessionIdQueryResult = Result<
    GetSurveillanceFormBySessionIdSuccessPayload,
    NetworkError
>;

type GetSurveillanceFormBySessionIdQueryOptions = Omit<
    UseQueryOptions<GetSurveillanceFormBySessionIdQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSurveillanceFormBySessionId(
    sessionId: number,
): Promise<GetSurveillanceFormBySessionIdQueryResult> {
    const response = await fetch(`/api/sessions/${sessionId}/survey`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getSurveillanceFormBySessionIdResult: GetSurveillanceFormBySessionIdQueryResult =
        await response.json();
    return getSurveillanceFormBySessionIdResult;
}

export function useGetSurveillanceFormBySessionId(
    sessionId: number,
    options?: GetSurveillanceFormBySessionIdQueryOptions,
) {
    return useQuery({
        queryKey: surveillanceFormKeys.surveillanceFormBySessionId(sessionId),
        queryFn: () => fetchSurveillanceFormBySessionId(sessionId),
        ...options,
    });
}

export function useGetSurveillanceFormsBySessionIds(sessionIds: number[]) {
    return useQueries({
        queries: sessionIds.map(sessionId => ({
            queryKey:
                surveillanceFormKeys.surveillanceFormBySessionId(sessionId),
            queryFn: () => fetchSurveillanceFormBySessionId(sessionId),
        })),
    });
}
