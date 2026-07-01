import type { GetFormAnswersBySessionIdSuccessPayload } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQueries } from '@tanstack/react-query';
import { formAnswerKeys } from '../form-answer-keys';

type GetFormAnswersBySessionIdQueryResult = Result<
    GetFormAnswersBySessionIdSuccessPayload,
    NetworkError
>;

async function fetchFormAnswersBySessionId(
    sessionId: number,
): Promise<GetFormAnswersBySessionIdQueryResult> {
    const response = await fetch(`/api/sessions/${sessionId}/forms/answers`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getFormAnswersBySessionIdResult: GetFormAnswersBySessionIdQueryResult =
        await response.json();
    return getFormAnswersBySessionIdResult;
}

export function useGetFormAnswersBySessionIds(sessionIds: number[]) {
    return useQueries({
        queries: sessionIds.map(sessionId => ({
            queryKey: formAnswerKeys.formAnswersBySessionId(sessionId),
            queryFn: () => fetchFormAnswersBySessionId(sessionId),
        })),
    });
}
