import { getSessionsMetrics } from '@/api/session/get-sessions-metrics';
import {
    getSessionsMetricsQueryParamsSchema,
    type GetSessionsMetricsResponseBody,
} from '@/api/session/validation/get-sessions-metrics-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSessionsMetricsQueryParamsSchema.safeParse(queryParams);
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message:
                    'Invalid query parameters: district, startDate, and endDate are required',
            }),
            { status: 400 },
        );
    }

    const authorizedGetSessionsMetricsResult =
        await withAuthSession<GetSessionsMetricsResponseBody>(accessToken =>
            getSessionsMetrics(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetSessionsMetricsResult, {
        status: authorizedGetSessionsMetricsResult.ok
            ? 200
            : (authorizedGetSessionsMetricsResult.error.status ?? 400),
    });
}
