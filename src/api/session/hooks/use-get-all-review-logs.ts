import { sessionKeys } from '../session-keys';
import { useQuery } from '@tanstack/react-query';
import {
    getAllReviewLogsResponseSchema,
    type GetAllReviewLogsResponse,
    getReviewLogsQueryParamsSchema,
    type GetReviewLogsQueryParams,
} from '@/api/session/validation/get-review-logs-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';

export function useGetAllReviewLogs(queryParams: GetReviewLogsQueryParams) {
    return useQuery({
        queryKey: sessionKeys.allReviewLogs(queryParams),
        queryFn: async (): Promise<
            Result<GetAllReviewLogsResponse, NetworkError>
        > => {
            const response = await fetch(
                `/api/sessions/review/logs/all${constructQueryString(queryParams, getReviewLogsQueryParamsSchema)}`,
            );
            const result: Result<unknown, NetworkError> = await response.json();
            if (!result.ok) return result;
            const parsed = getAllReviewLogsResponseSchema.safeParse(
                result.data,
            );
            return parsed.success
                ? { ok: true, data: parsed.data }
                : {
                      ok: false,
                      error: { kind: 'client', message: 'Invalid response' },
                  };
        },
    });
}
