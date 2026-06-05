import { useQueries } from '@tanstack/react-query';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import {
    getFormAnswersBySessionIdQueryParamsSchema,
    type GetFormAnswersBySessionIdQueryParams,
    type GetFormAnswersBySessionIdSuccessPayload,
} from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetFormAnswersBySessionIdQueryResult = Result<
    GetFormAnswersBySessionIdSuccessPayload,
    NetworkError
>;

async function fetchFormAnswersBySessionId(
    sessionId: number,
    queryParams: GetFormAnswersBySessionIdQueryParams,
): Promise<GetFormAnswersBySessionIdQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getFormAnswersBySessionIdQueryParamsSchema,
    );
    const response = await fetch(
        `/api/sessions/${sessionId}/forms/answers${queryString}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        },
    );
    const getFormAnswersBySessionIdResult: GetFormAnswersBySessionIdQueryResult =
        await response.json();
    return getFormAnswersBySessionIdResult;
}

export function useGetFormAnswersBySessionIds(
    sessionIds: number[],
    queryParams: GetFormAnswersBySessionIdQueryParams = {},
) {
    return useQueries({
        queries: sessionIds.map(sessionId => ({
            queryKey: formAnswerKeys.formAnswersBySessionId(
                sessionId,
                queryParams.version,
            ),
            queryFn: () => fetchFormAnswersBySessionId(sessionId, queryParams),
        })),
    });
}
