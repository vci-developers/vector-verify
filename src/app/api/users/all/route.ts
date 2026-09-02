import { getAllUsers } from '@/api/user/get-all-users';
import type { GetAllUsersResponseBody } from '@/api/user/validation/get-all-users-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET() {
    const authorizedGetAllUsersResult =
        await withAuthSession<GetAllUsersResponseBody>(accessToken =>
            getAllUsers(accessToken),
        );

    return NextResponse.json(authorizedGetAllUsersResult, {
        status: authorizedGetAllUsersResult.ok
            ? 200
            : (authorizedGetAllUsersResult.error.status ?? 400),
    });
}
