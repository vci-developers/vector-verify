import { getAnnotations } from '@/api/annotation/get-annotations';
import {
    getAnnotationsQueryParamsSchema,
    type GetAnnotationsResponseBody,
} from '@/api/annotation/validation/get-annotations-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET(request: Request) {
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

    const authorizedGetAnnotationsResult =
        await withAuthSession<GetAnnotationsResponseBody>(accessToken =>
            getAnnotations(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAnnotationsResult, {
        status: authorizedGetAnnotationsResult.ok
            ? 200
            : (authorizedGetAnnotationsResult.error.status ?? 400),
    });
}
