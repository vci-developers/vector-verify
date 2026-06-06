import { getDhis2SyncTasks } from '@/api/dhis2/get-dhis2-sync-tasks';
import {
    getDhis2SyncTasksQueryParamsSchema,
    type GetDhis2SyncTasksResponseBody,
} from '@/api/dhis2/validation/get-dhis2-sync-tasks-schema';
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
