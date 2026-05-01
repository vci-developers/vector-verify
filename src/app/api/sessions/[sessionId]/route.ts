import { getSessionById } from '@/api/session/get-session-by-id';
import { putSession } from '@/api/session/put-session';
import type { GetSessionByIdResponseBody } from '@/api/session/validation/get-session-by-id-schema';
import type {
    PutSessionRequestBody,
    PutSessionResponseBody,
} from '@/api/session/validation/put-session-schema';
import { err } from '@/lib/result/result';
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

export async function PUT(request: Request, { params }: RouteParams) {
    const sessionId = Number((await params).sessionId);

    let requestBody: PutSessionRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const result = await withAuthSession<PutSessionResponseBody>(accessToken =>
        putSession(accessToken, sessionId, requestBody),
    );

    return NextResponse.json(result, {
        status: result.ok ? 200 : (result.error.status ?? 400),
    });
}
