import { getSessionById } from '@/api/session/get-session-by-id';
import type { GetSessionByIdResponseBody } from '@/api/session/validation/get-session-by-id-schema';
import { putSessionById } from '@/api/session/put-session-by-id';
import type {
    PutSessionByIdRequestBody,
    PutSessionByIdResponseBody,
} from '@/api/session/validation/put-session-by-id-schema';
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

    let requestBody: PutSessionByIdRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const authorizedPutSessionByIdResult =
        await withAuthSession<PutSessionByIdResponseBody>(accessToken =>
            putSessionById(accessToken, sessionId, requestBody),
        );

    return NextResponse.json(authorizedPutSessionByIdResult, {
        status: authorizedPutSessionByIdResult.ok
            ? 200
            : (authorizedPutSessionByIdResult.error.status ?? 400),
    });
}
