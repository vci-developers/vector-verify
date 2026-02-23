import { getAnnotationTasks } from '@/api/annotation-task/get-annotation-tasks';
import {
    getAnnotationTasksQueryParamsSchema,
    type GetAnnotationTasksResponseBody,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        const sessionExpiredErrorResult = err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
        return NextResponse.json(sessionExpiredErrorResult, { status: 401 });
    }

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

    const getAnnotationTasksResult: Result<
        GetAnnotationTasksResponseBody,
        NetworkError
    > = await getAnnotationTasks(accessToken, parsedQueryParams.data);

    if (!getAnnotationTasksResult.ok) {
        return NextResponse.json(err(getAnnotationTasksResult.error), {
            status: getAnnotationTasksResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getAnnotationTasksResult.data), {
        status: 200,
    });
}
