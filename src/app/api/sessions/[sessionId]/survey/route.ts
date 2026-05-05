import { getSurveillanceFormDataBySessionId } from '@/api/surveillance-form/get-surveillance-form-data-by-session-id';
import type { SurveillanceFormData } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
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

    const authorizedGetSurveillanceFormDataBySessionIdResult =
        await withAuthSession<SurveillanceFormData>(accessToken =>
            getSurveillanceFormDataBySessionId(accessToken, sessionId),
        );

    return NextResponse.json(
        authorizedGetSurveillanceFormDataBySessionIdResult,
        {
            status: authorizedGetSurveillanceFormDataBySessionIdResult.ok
                ? 200
                : (authorizedGetSurveillanceFormDataBySessionIdResult.error
                      .status ?? 400),
        },
    );
}
