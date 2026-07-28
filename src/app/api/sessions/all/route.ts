import { getAllSessions } from '@/api/session/get-all-sessions';
import {
    getAllSessionsQueryParamsSchema,
    type GetAllSessionsResponseBody,
} from '@/api/session/validation/get-all-sessions-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAllSessionsQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetAllSessionsResult =
        await withAuthSession<GetAllSessionsResponseBody>(accessToken =>
            getAllSessions(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAllSessionsResult, {
        status: authorizedGetAllSessionsResult.ok
            ? 200
            : (authorizedGetAllSessionsResult.error.status ?? 400),
    });
}
