import { getSessionSpecimensCount } from '@/api/specimen/get-session-specimens-count';
import {
    getSessionSpecimensCountQueryParamsSchema,
    type GetSessionSpecimensCountResponseBody,
} from '@/api/specimen/validation/get-session-specimens-count-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSessionSpecimensCountQueryParamsSchema.safeParse(queryParams);

    if (!parsedQueryParams.success) {
        return NextResponse.json(
            err({
                kind: 'client',
                status: 400,
                message: `Invalid query parameters`,
            }),
            { status: 400 },
        );
    }

    const authorizedGetSessionSpecimensCountResult =
        await withAuthSession<GetSessionSpecimensCountResponseBody>(
            accessToken =>
                getSessionSpecimensCount(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetSessionSpecimensCountResult, {
        status: authorizedGetSessionSpecimensCountResult.ok
            ? 200
            : (authorizedGetSessionSpecimensCountResult.error.status ?? 400),
    });
}
