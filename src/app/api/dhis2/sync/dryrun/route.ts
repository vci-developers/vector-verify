import { postDhis2SyncDryRun } from '@/api/dhis2/post-dhis2-sync-dry-run';
import {
    postDhis2SyncDryRunQueryParamsSchema,
    postDhis2SyncDryRunRequestSchema,
    type PostDhis2SyncDryRunRequestBody,
    type PostDhis2SyncDryRunResponseBody,
} from '@/api/dhis2/validation/post-dhis2-sync-dry-run-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        postDhis2SyncDryRunQueryParamsSchema.safeParse(queryParams);
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

    let requestBody: PostDhis2SyncDryRunRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const parsedBody = postDhis2SyncDryRunRequestSchema.safeParse(requestBody);
    if (!parsedBody.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: 'Invalid request body',
            }),
            { status: 400 },
        );
    }

    const authorizedPostDhis2SyncDryRunResult =
        await withAuthSession<PostDhis2SyncDryRunResponseBody>(accessToken =>
            postDhis2SyncDryRun(
                accessToken,
                parsedQueryParams.data,
                parsedBody.data,
            ),
        );

    return NextResponse.json(authorizedPostDhis2SyncDryRunResult, {
        status: authorizedPostDhis2SyncDryRunResult.ok
            ? 200
            : (authorizedPostDhis2SyncDryRunResult.error.status ?? 400),
    });
}
