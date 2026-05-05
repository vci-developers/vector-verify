import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import {
    formAnswersSchema,
    type FormAnswers,
} from '@/api/surveillance-form/validation/form-answers-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getFormAnswersBySessionId(
    accessToken: string,
    sessionId: number,
    version?: string,
): Promise<Result<FormAnswers, NetworkError>> {
    const params = version ? `?version=${encodeURIComponent(version)}` : '';
    return safeApiCall<FormAnswers>(
        `/sessions/${sessionId}/forms/answers${params}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        formAnswersSchema,
    );
}
