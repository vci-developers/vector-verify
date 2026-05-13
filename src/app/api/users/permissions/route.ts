import { getUserPermissions } from '@/api/user/get-user-permissions';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET() {
    const authorizedGetUserPermissionsResult =
        await withAuthSession<GetUserPermissionsResponseBody>(
            getUserPermissions,
        );

    return NextResponse.json(authorizedGetUserPermissionsResult, {
        status: authorizedGetUserPermissionsResult.ok
            ? 200
            : (authorizedGetUserPermissionsResult.error.status ?? 400),
    });
}
