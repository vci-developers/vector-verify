import {
    type GetAllReviewLogsQueryParams,
    type GetAllReviewLogsResponseBody,
} from '@/api/review-log/validation/get-all-review-logs-schema';
import {
    getReviewLogsQueryParamsSchema,
    getReviewLogsResponseSchema,
    type GetReviewLogsResponseBody,
} from '@/api/review-log/validation/get-review-logs-schema';
import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';
import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

const SIZE = 100;

export async function getAllReviewLogs(
    accessToken: string,
    queryParams: GetAllReviewLogsQueryParams,
): Promise<Result<GetAllReviewLogsResponseBody, NetworkError>> {
    const allReviewLogs: ReviewLog[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        const queryString = constructQueryString(
            { ...queryParams, size: SIZE, page },
            getReviewLogsQueryParamsSchema,
        );

        const result = await safeApiCall<GetReviewLogsResponseBody>(
            `/sessions/review/logs${queryString}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            getReviewLogsResponseSchema,
        );

        if (!result.ok) return result;

        allReviewLogs.push(...result.data.logs);
        totalPages = result.data.pagination.totalPages;
        page += 1;
    }

    return ok({
        message: `Retrieved ${allReviewLogs.length} review logs successfully`,
        logs: allReviewLogs,
    });
}
