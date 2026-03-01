import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { GetSurveillanceFormBySessionIdSuccessPayload } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import { surveillanceFormKeys } from '../surveillance-form-keys';

type SurveillanceFormBySessionIdQueryResult = Result<
    GetSurveillanceFormBySessionIdSuccessPayload,
    NetworkError
>;

type SurveillanceFormBySessionIdQueryOptions = Omit<
    UseQueryOptions<SurveillanceFormBySessionIdQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSurveillanceFormBySessionId(
    sessionId: number,
): Promise<SurveillanceFormBySessionIdQueryResult> {
    const response = await fetch(`/api/sessions/${sessionId}/survey`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const surveillanceFormBySessionIdResult: SurveillanceFormBySessionIdQueryResult =
        await response.json();
    return surveillanceFormBySessionIdResult;
}

export function useSurveillanceFormBySessionId(
    sessionId: number,
    options?: SurveillanceFormBySessionIdQueryOptions,
) {
    return useQuery({
        queryKey: surveillanceFormKeys.surveillanceFormBySessionId(sessionId),
        queryFn: () => fetchSurveillanceFormBySessionId(sessionId),
        ...options,
    });
}
