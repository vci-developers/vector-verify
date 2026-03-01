import { getSurveillanceFormBySessionId } from '@/api/surveillance-form/get-surveillance-form-by-session-id';
import type { GetSurveillanceFormBySessionIdResponseBody } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

interface GetSurveillanceFormBySessionIdRouteParams {
    params: Promise<{
        sessionId: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: GetSurveillanceFormBySessionIdRouteParams,
) {
    const sessionId = Number((await params).sessionId);

    const authorizedGetSurveillanceFormBySessionIdResult =
        await withAuthSession<GetSurveillanceFormBySessionIdResponseBody>(
            accessToken =>
                getSurveillanceFormBySessionId(accessToken, sessionId),
        );

    return NextResponse.json(authorizedGetSurveillanceFormBySessionIdResult, {
        status: authorizedGetSurveillanceFormBySessionIdResult.ok
            ? 200
            : (authorizedGetSurveillanceFormBySessionIdResult.error.status ??
              400),
    });
}
