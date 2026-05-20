import type { Result } from '@/lib/result/result';
import {
    getFormAnswersBySessionIdQueryParamsSchema,
    getFormAnswersBySessionIdResponseSchema,
    type GetFormAnswersBySessionIdQueryParams,
    type GetFormAnswersBySessionIdResponseBody,
} from './validation/get-form-answers-by-session-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getFormAnswersBySessionId(
    accessToken: string,
    sessionId: number,
    queryParams?: GetFormAnswersBySessionIdQueryParams,
): Promise<Result<GetFormAnswersBySessionIdResponseBody, NetworkError>> {
    const queryString =
        constructQueryString<GetFormAnswersBySessionIdQueryParams>(
            queryParams,
            getFormAnswersBySessionIdQueryParamsSchema,
        );

    return safeApiCall<GetFormAnswersBySessionIdResponseBody>(
        `/sessions/${sessionId}/forms/answers${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getFormAnswersBySessionIdResponseSchema,
    );
}
