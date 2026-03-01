import { getSpecimens } from '@/api/specimen/get-specimens';
import {
    getSpecimensQueryParamsSchema,
    type GetSpecimensResponseBody,
} from '@/api/specimen/validation/get-specimens-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getSpecimensQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetSpecimensResult =
        await withAuthSession<GetSpecimensResponseBody>(accessToken =>
            getSpecimens(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetSpecimensResult, {
        status: authorizedGetSpecimensResult.ok
            ? 200
            : (authorizedGetSpecimensResult.error.status ?? 400),
    });
}
