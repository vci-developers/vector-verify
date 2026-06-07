import { getDhis2SyncTasks } from '@/api/dhis2/get-dhis2-sync-tasks';
import { postDhis2SyncTask } from '@/api/dhis2/post-dhis2-sync-task';
import {
    getDhis2SyncTasksQueryParamsSchema,
    type GetDhis2SyncTasksResponseBody,
} from '@/api/dhis2/validation/get-dhis2-sync-tasks-schema';
import {
    postDhis2SyncTaskQueryParamsSchema,
    postDhis2SyncTaskRequestSchema,
    type PostDhis2SyncTaskRequestBody,
    type PostDhis2SyncTaskResponseBody,
} from '@/api/dhis2/validation/post-dhis2-sync-task-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getDhis2SyncTasksQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetDhis2SyncTasksResult =
        await withAuthSession<GetDhis2SyncTasksResponseBody>(accessToken =>
            getDhis2SyncTasks(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetDhis2SyncTasksResult, {
        status: authorizedGetDhis2SyncTasksResult.ok
            ? 200
            : (authorizedGetDhis2SyncTasksResult.error.status ?? 400),
    });
}

export async function POST(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        postDhis2SyncTaskQueryParamsSchema.safeParse(queryParams);
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

    let requestBody: PostDhis2SyncTaskRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        return NextResponse.json(
            err({ kind: 'client', status: 400, message: 'Invalid JSON body' }),
            { status: 400 },
        );
    }

    const parsedBody = postDhis2SyncTaskRequestSchema.safeParse(requestBody);
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

    const authorizedPostDhis2TaskSyncResult =
        await withAuthSession<PostDhis2SyncTaskResponseBody>(accessToken =>
            postDhis2SyncTask(
                accessToken,
                parsedQueryParams.data,
                parsedBody.data,
            ),
        );

    return NextResponse.json(authorizedPostDhis2TaskSyncResult, {
        status: authorizedPostDhis2TaskSyncResult.ok
            ? 202
            : (authorizedPostDhis2TaskSyncResult.error.status ?? 400),
    });
}
