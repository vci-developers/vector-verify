import { getSessionsReport } from '@/api/session/get-sessions-report';
import { getSessionsReportQueryParamsSchema } from '@/api/session/validation/get-sessions-report-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSessionsReportQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetSessionsReportResult =
        await withAuthSession<NextResponse>(accessToken =>
            getSessionsReport(accessToken, parsedQueryParams.data),
        );

    if (!authorizedGetSessionsReportResult.ok) {
        return NextResponse.json(authorizedGetSessionsReportResult, {
            status: authorizedGetSessionsReportResult.error.status ?? 400,
        });
    }

    return authorizedGetSessionsReportResult.data;
}
