import { getCollectionCycles } from '@/api/collection-cycle/get-collection-cycles';
import {
    getCollectionCyclesQueryParamsSchema,
    type GetCollectionCyclesResponseBody,
} from '@/api/collection-cycle/validation/collection-cycle-schema';
import { err } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getCollectionCyclesQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetCollectionCyclesResult =
        await withAuthSession<GetCollectionCyclesResponseBody>(accessToken =>
            getCollectionCycles(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetCollectionCyclesResult, {
        status: authorizedGetCollectionCyclesResult.ok
            ? 200
            : (authorizedGetCollectionCyclesResult.error.status ?? 400),
    });
}
