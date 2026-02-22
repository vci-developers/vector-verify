import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import { getSessionById } from '@/features/review_new/api/session/get-session-by-id';
import type { GetSessionByIdResponseBody } from '@/features/review_new/api/session/validation/get-session-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface GetSessionByIdRouteParams {
    params: Promise<{
        sessionId: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: GetSessionByIdRouteParams,
) {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        const sessionExpiredErrorResult = err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
        return NextResponse.json(sessionExpiredErrorResult, { status: 401 });
    }

    const sessionId = Number((await params).sessionId);

    const getSessionByIdResult: Result<
        GetSessionByIdResponseBody,
        NetworkError
    > = await getSessionById(accessToken, sessionId);

    if (!getSessionByIdResult.ok) {
        return NextResponse.json(err(getSessionByIdResult.error), {
            status: getSessionByIdResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getSessionByIdResult.data), { status: 200 });
}
