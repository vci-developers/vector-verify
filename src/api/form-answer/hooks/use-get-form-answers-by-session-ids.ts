import { useQueries } from '@tanstack/react-query';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import type { GetFormAnswersBySessionIdSuccessPayload } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import { getFormAnswersBySessionIdQueryParamsSchema } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetFormAnswersBySessionIdQueryResult = Result<
    GetFormAnswersBySessionIdSuccessPayload,
    NetworkError
>;

async function fetchFormAnswersBySessionId(
    sessionId: number,
    version?: string,
): Promise<GetFormAnswersBySessionIdQueryResult> {
    const queryString = constructQueryString(
        { version },
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
    const result: GetFormAnswersBySessionIdQueryResult = await response.json();
    return result;
}

export function useGetFormAnswersBySessionIds(
    sessionIds: number[],
    version?: string,
) {
    return useQueries({
        queries: sessionIds.map(sessionId => ({
            queryKey: formAnswerKeys.formAnswersBySessionId(sessionId, version),
            queryFn: () => fetchFormAnswersBySessionId(sessionId, version),
        })),
    });
}
