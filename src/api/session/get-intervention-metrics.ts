import {
    sessionMetricsQueryParamsSchema,
    sessionMetricsResponseSchema,
    type GetInterventionMetricsQueryParams,
    type GetInterventionMetricsResponseBody,
    type SessionMetricsQueryParams,
    type SessionMetricsResponseBody,
} from '@/api/session/validation/get-intervention-metrics-schema';
import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

function getSessionMetricsForDistrict(
    accessToken: string,
    queryParams: SessionMetricsQueryParams,
): Promise<Result<SessionMetricsResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        sessionMetricsQueryParamsSchema,
    );

    return safeApiCall<SessionMetricsResponseBody>(
        `/sessions/metrics${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        sessionMetricsResponseSchema,
    );
}

export async function getInterventionMetrics(
    accessToken: string,
    queryParams: GetInterventionMetricsQueryParams,
): Promise<Result<GetInterventionMetricsResponseBody, NetworkError>> {
    const results = await Promise.all(
        queryParams.districts.map(district =>
            getSessionMetricsForDistrict(accessToken, {
                district: String(district),
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
            }),
        ),
    );

    const districtMetrics: SessionMetricsResponseBody[] = [];
    for (const result of results) {
        if (!result.ok) return result;
        districtMetrics.push(result.data);
    }

    return ok({ districtMetrics });
}
