import { getSessionById } from '@/api/session/get-session-by-id';
import type { GetSessionByIdResponseBody } from '@/api/session/validation/get-session-by-id-schema';
import { updateSession } from '@/api/session/update-session';
import type {
    UpdateSessionRequestBody,
    UpdateSessionResponseBody,
} from '@/api/session/validation/update-session-schema';
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

    let requestBody: UpdateSessionRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const authorizedUpdateSessionResult =
        await withAuthSession<UpdateSessionResponseBody>(accessToken =>
            updateSession(accessToken, sessionId, requestBody),
        );

    return NextResponse.json(authorizedUpdateSessionResult, {
        status: authorizedUpdateSessionResult.ok
            ? 200
            : (authorizedUpdateSessionResult.error.status ?? 400),
    });
}
