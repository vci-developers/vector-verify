import {
    getAllReviewLogsQueryParamsSchema,
    type GetAllReviewLogsQueryParams,
    type GetAllReviewLogsSuccessPayload,
} from '@/api/review-log/validation/get-all-review-logs-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { reviewLogKeys } from '@/api/review-log/review-log-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';

type GetAllReviewLogsQueryResult = Result<
    GetAllReviewLogsSuccessPayload,
    NetworkError
>;

type GetAllReviewLogsQueryOptions = Omit<
    UseQueryOptions<GetAllReviewLogsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllReviewLogs(
    queryParams: GetAllReviewLogsQueryParams,
): Promise<GetAllReviewLogsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getAllReviewLogsQueryParamsSchema,
    );

    const response = await fetch(
        `/api/sessions/review/logs/all${queryString}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    const getAllReviewLogsResult: GetAllReviewLogsQueryResult =
        await response.json();
    return getAllReviewLogsResult;
}

export function useGetAllReviewLogs(
    queryParams: GetAllReviewLogsQueryParams,
    options?: GetAllReviewLogsQueryOptions,
) {
    return useQuery({
        queryKey: reviewLogKeys.allReviewLogs(queryParams),
        queryFn: () => fetchAllReviewLogs(queryParams),
        ...options,
    });
}
