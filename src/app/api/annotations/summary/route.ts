import { getAnnotationsSummary } from '@/api/annotation/get-annotations-summary';
import {
    getAnnotationsSummaryQueryParamsSchema,
    type GetAnnotationsSummaryResponseBody,
} from '@/api/annotation/validation/get-annotations-summary-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAnnotationsSummaryQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetAnnotationsSummaryResult =
        await withAuthSession<GetAnnotationsSummaryResponseBody>(accessToken =>
            getAnnotationsSummary(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAnnotationsSummaryResult, {
        status: authorizedGetAnnotationsSummaryResult.ok
            ? 200
            : (authorizedGetAnnotationsSummaryResult.error.status ?? 400),
    });
}
