import { getSurveillanceFormBySessionId } from '@/api/surveillance-form/get-surveillance-form-by-session-id';
import type { GetSurveillanceFormBySessionIdResponseBody } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface GetSurveillanceFormBySessionIdRouteParams {
    params: Promise<{
        sessionId: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: GetSurveillanceFormBySessionIdRouteParams,
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

    const getSurveillanceFormBySessionIdResult: Result<
        GetSurveillanceFormBySessionIdResponseBody,
        NetworkError
    > = await getSurveillanceFormBySessionId(accessToken, sessionId);

    if (!getSurveillanceFormBySessionIdResult.ok) {
        return NextResponse.json(
            err(getSurveillanceFormBySessionIdResult.error),
            {
                status:
                    getSurveillanceFormBySessionIdResult.error.status ?? 400,
            },
        );
    }

    return NextResponse.json(ok(getSurveillanceFormBySessionIdResult.data), {
        status: 200,
    });
}
