import { getAllSpecimens } from '@/api/specimen/get-all-specimens';
import {
    getAllSpecimensQueryParamsSchema,
    type GetAllSpecimensResponseBody,
} from '@/api/specimen/validation/get-all-specimens-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAllSpecimensQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetAllSpecimensResult =
        await withAuthSession<GetAllSpecimensResponseBody>(accessToken =>
            getAllSpecimens(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAllSpecimensResult, {
        status: authorizedGetAllSpecimensResult.ok
            ? 200
            : (authorizedGetAllSpecimensResult.error.status ?? 400),
    });
}
