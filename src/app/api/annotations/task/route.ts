import { getAnnotationTasks } from '@/api/annotation-task/get-annotation-tasks';
import {
    getAnnotationTasksQueryParamsSchema,
    type GetAnnotationTasksResponseBody,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAnnotationTasksQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetAnnotationTasksResult =
        await withAuthSession<GetAnnotationTasksResponseBody>(accessToken =>
            getAnnotationTasks(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAnnotationTasksResult, {
        status: authorizedGetAnnotationTasksResult.ok
            ? 200
            : (authorizedGetAnnotationTasksResult.error.status ?? 400),
    });
}
