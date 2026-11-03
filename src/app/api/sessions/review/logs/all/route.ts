import { getAllReviewLogs } from '@/api/review-log/get-all-review-logs';
import {
    getAllReviewLogsQueryParamsSchema,
    type GetAllReviewLogsResponseBody,
} from '@/api/review-log/validation/get-all-review-logs-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAllReviewLogsQueryParamsSchema.safeParse(queryParams);
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid query parameters',
            }),
            { status: 400 },
        );
    }

    const authorizedGetAllReviewLogsResult =
        await withAuthSession<GetAllReviewLogsResponseBody>(accessToken =>
            getAllReviewLogs(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAllReviewLogsResult, {
        status: authorizedGetAllReviewLogsResult.ok
            ? 200
            : (authorizedGetAllReviewLogsResult.error.status ?? 400),
    });
}
