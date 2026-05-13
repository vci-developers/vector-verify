import { getMonthlySpecimensCount } from '@/api/specimen/get-monthly-specimens-count';
import {
    getMonthlySpecimensCountQueryParamsSchema,
    type GetMonthlySpecimensCountResponseBody,
} from '@/api/specimen/validation/get-monthly-specimens-count-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getMonthlySpecimensCountQueryParamsSchema.safeParse(queryParams);

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

    const authorizedGetMonthlySpecimensCountResult =
        await withAuthSession<GetMonthlySpecimensCountResponseBody>(
            accessToken =>
                getMonthlySpecimensCount(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetMonthlySpecimensCountResult, {
        status: authorizedGetMonthlySpecimensCountResult.ok
            ? 200
            : (authorizedGetMonthlySpecimensCountResult.error.status ?? 400),
    });
}
