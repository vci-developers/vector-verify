import { getUserActiveMetrics } from '@/api/user/get-user-active-metrics';
import {
    getUserActiveMetricsQueryParamsSchema,
    type GetUserActiveMetricsResponseBody,
} from '@/api/user/validation/get-user-active-metrics-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getUserActiveMetricsQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetUserActiveMetricsResult =
        await withAuthSession<GetUserActiveMetricsResponseBody>(accessToken =>
            getUserActiveMetrics(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetUserActiveMetricsResult, {
        status: authorizedGetUserActiveMetricsResult.ok
            ? 200
            : (authorizedGetUserActiveMetricsResult.error.status ?? 400),
    });
}
