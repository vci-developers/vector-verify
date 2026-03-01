import { getSessions } from '@/api/session/get-sessions';
import {
    getSessionsQueryParamsSchema,
    type GetSessionsResponseBody,
} from '@/api/session/validation/get-sessions-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSessionsQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetSessionsResult =
        await withAuthSession<GetSessionsResponseBody>(accessToken =>
            getSessions(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetSessionsResult, {
        status: authorizedGetSessionsResult.ok
            ? 200
            : (authorizedGetSessionsResult.error.status ?? 400),
    });
}
