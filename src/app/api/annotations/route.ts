import { getAnnotations } from '@/api/annotation/get-annotations';
import {
    getAnnotationsQueryParamsSchema,
    type GetAnnotationsResponseBody,
} from '@/api/annotation/validation/get-annotations-schema';
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
        getAnnotationsQueryParamsSchema.safeParse(queryParams);
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

    const getAnnotationsResult: Result<
        GetAnnotationsResponseBody,
        NetworkError
    > = await getAnnotations(accessToken, parsedQueryParams.data);

    if (!getAnnotationsResult.ok) {
        return NextResponse.json(err(getAnnotationsResult.error), {
            status: getAnnotationsResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getAnnotationsResult.data), { status: 200 });
}
