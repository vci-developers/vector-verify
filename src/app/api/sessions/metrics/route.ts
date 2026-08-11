import { getInterventionMetrics } from '@/api/session/get-intervention-metrics';
import {
    getInterventionMetricsQueryParamsSchema,
    type GetInterventionMetricsResponseBody,
} from '@/api/session/validation/get-intervention-metrics-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getInterventionMetricsQueryParamsSchema.safeParse(queryParams);
    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message:
                    'Invalid query parameters: districts, startDate, and endDate are required',
            }),
            { status: 400 },
        );
    }

    const authorizedGetInterventionMetricsResult =
        await withAuthSession<GetInterventionMetricsResponseBody>(accessToken =>
            getInterventionMetrics(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetInterventionMetricsResult, {
        status: authorizedGetInterventionMetricsResult.ok
            ? 200
            : (authorizedGetInterventionMetricsResult.error.status ?? 400),
    });
}
