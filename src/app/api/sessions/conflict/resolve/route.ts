import { resolveSessionConflicts } from '@/api/session/resolve-conflicts';
import type {
    ResolveSessionConflictsRequestBody,
    ResolveSessionConflictsResponseBody,
} from '@/api/session/validation/resolve-session-conflicts-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function POST(request: Request) {
    let requestBody: ResolveSessionConflictsRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const authorizedResolveConflictResult =
        await withAuthSession<ResolveSessionConflictsResponseBody>(
            accessToken => resolveSessionConflicts(accessToken, requestBody),
        );

    return NextResponse.json(authorizedResolveConflictResult, {
        status: authorizedResolveConflictResult.ok
            ? 200
            : (authorizedResolveConflictResult.error.status ?? 400),
    });
}
