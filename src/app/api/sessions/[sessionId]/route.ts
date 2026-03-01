import { getSessionById } from '@/api/session/get-session-by-id';
import type { GetSessionByIdResponseBody } from '@/api/session/validation/get-session-by-id-schema';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

interface RouteParams {
    params: Promise<{
        sessionId: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
    const sessionId = Number((await params).sessionId);

    const authorizedGetSessionByIdResult =
        await withAuthSession<GetSessionByIdResponseBody>(accessToken =>
            getSessionById(accessToken, sessionId),
        );

    return NextResponse.json(authorizedGetSessionByIdResult, {
        status: authorizedGetSessionByIdResult.ok
            ? 200
            : (authorizedGetSessionByIdResult.error.status ?? 400),
    });
}
