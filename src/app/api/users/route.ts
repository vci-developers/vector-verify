import { getUsers } from '@/api/user/get-users';
import type { GetUsersResponseBody } from '@/api/user/validation/get-users-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET() {
    const authorizedGetUsersResult =
        await withAuthSession<GetUsersResponseBody>(accessToken =>
            getUsers(accessToken),
        );

    return NextResponse.json(authorizedGetUsersResult, {
        status: authorizedGetUsersResult.ok
            ? 200
            : (authorizedGetUsersResult.error.status ?? 400),
    });
}
