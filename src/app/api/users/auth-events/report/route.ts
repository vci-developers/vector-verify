import { getUserAuthEventsReport } from '@/api/user/get-user-auth-events-report';
import { getUserAuthEventsReportQueryParamsSchema } from '@/api/user/validation/get-user-auth-events-report-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getUserAuthEventsReportQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetUserAuthEventsReportResult =
        await withAuthSession<NextResponse>(accessToken =>
            getUserAuthEventsReport(accessToken, parsedQueryParams.data),
        );

    if (!authorizedGetUserAuthEventsReportResult.ok) {
        return NextResponse.json(authorizedGetUserAuthEventsReportResult, {
            status: authorizedGetUserAuthEventsReportResult.error.status ?? 400,
        });
    }

    return authorizedGetUserAuthEventsReportResult.data;
}
