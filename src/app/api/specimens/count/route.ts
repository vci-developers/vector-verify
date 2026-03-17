import { getSpecimensCount } from '@/api/specimen/get-specimens-count';
import {
    getSpecimensCountQueryParamsSchema,
    type GetSpecimensCountResponseBody,
} from '@/api/specimen/validation/get-specimens-count-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSpecimensCountQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetSpecimensCountResult =
        await withAuthSession<GetSpecimensCountResponseBody>(accessToken =>
            getSpecimensCount(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetSpecimensCountResult, {
        status: authorizedGetSpecimensCountResult.ok
            ? 200
            : (authorizedGetSpecimensCountResult.error.status ?? 400),
    });
}
