import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import { getSpecimens } from '@/features/review_new/api/specimen/get-specimens';
import {
    getSpecimensQueryParamsSchema,
    type GetSpecimensResponseBody,
} from '@/features/review_new/api/specimen/validation/get-specimens-schema';
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

    const getSpecimensResult: Result<GetSpecimensResponseBody, NetworkError> =
        await getSpecimens(accessToken, parsedQueryParams.data);

    if (!getSpecimensResult.ok) {
        return NextResponse.json(err(getSpecimensResult.error), {
            status: getSpecimensResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getSpecimensResult.data), { status: 200 });
}
