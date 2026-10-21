import 'server-only';
import {
    getReviewLogsQueryParamsSchema,
    getReviewLogsResponseSchema,
    type GetReviewLogsQueryParams,
    type GetAllReviewLogsResponse,
} from './validation/get-review-logs-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';
import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

export async function getAllReviewLogs(
    accessToken: string,
    queryParams?: GetReviewLogsQueryParams,
): Promise<Result<GetAllReviewLogsResponse, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getReviewLogsQueryParamsSchema,
    );
    const logs: GetAllReviewLogsResponse['logs'] = [];
    let page = 1;
    do {
        const result = await safeApiCall(
            `/sessions/review/logs${queryString}${queryString ? '&' : '?'}page=${page}&size=100`,
            {
                method: 'GET',
                headers: { Authorization: `Bearer ${accessToken}` },
            },
            getReviewLogsResponseSchema,
        );
        if (!result.ok) return result;
        logs.push(...result.data.logs);
        if (page >= result.data.pagination.totalPages) break;
        page++;
    } while (true);
    return ok({ logs });
}
