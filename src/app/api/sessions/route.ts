import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import { getSessions } from '@/api/session/get-sessions';
import {
    getSessionsQueryParamsSchema,
    type GetSessionsResponseBody,
} from '@/api/session/validation/get-sessions-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        const sessionExpiredErrorResult = err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
        return NextResponse.json(sessionExpiredErrorResult, { status: 401 });
    }

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

    const getSessionsResult: Result<GetSessionsResponseBody, NetworkError> =
        await getSessions(accessToken, parsedQueryParams.data);

    if (!getSessionsResult.ok) {
        return NextResponse.json(err(getSessionsResult.error), {
            status: getSessionsResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getSessionsResult.data), { status: 200 });
}
