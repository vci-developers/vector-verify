import { getAllUserAuthEvents } from '@/api/user/get-all-user-auth-events';
import {
    getAllUserAuthEventsQueryParamsSchema,
    type GetAllUserAuthEventsResponseBody,
} from '@/api/user/validation/get-all-user-auth-events-schema';
import { err } from '@/lib/result/result';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parsedQueryParams =
        getAllUserAuthEventsQueryParamsSchema.safeParse(queryParams);
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

    const authorizedGetAllUserAuthEventsResult =
        await withAuthSession<GetAllUserAuthEventsResponseBody>(accessToken =>
            getAllUserAuthEvents(accessToken, parsedQueryParams.data),
        );

    return NextResponse.json(authorizedGetAllUserAuthEventsResult, {
        status: authorizedGetAllUserAuthEventsResult.ok
            ? 200
            : (authorizedGetAllUserAuthEventsResult.error.status ?? 400),
    });
}
