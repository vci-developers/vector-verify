import { getUsers } from '@/api/user/get-users';
import {
    getUsersQueryParamsSchema,
    type GetUsersResponseBody,
} from '@/api/user/validation/get-users-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams = getUsersQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetUsersResult =
        await withAuthSession<GetUsersResponseBody>(accessToken =>
            getUsers(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetUsersResult, {
        status: authorizedGetUsersResult.ok
            ? 200
            : (authorizedGetUsersResult.error.status ?? 400),
    });
}
