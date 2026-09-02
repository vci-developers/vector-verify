import {
    getUserAuthEventsQueryParamsSchema,
    getUserAuthEventsResponseSchema,
    type GetUserAuthEventsResponseBody,
} from '@/api/user/validation/get-user-auth-events-schema';
import type { AuthEvent } from '@/api/user/validation/auth-event-schema';
import {
    type GetAllUserAuthEventsQueryParams,
    type GetAllUserAuthEventsResponseBody,
} from '@/api/user/validation/get-all-user-auth-events-schema';
import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

const LIMIT = 500;

export async function getAllUserAuthEvents(
    accessToken: string,
    queryParams: GetAllUserAuthEventsQueryParams,
): Promise<Result<GetAllUserAuthEventsResponseBody, NetworkError>> {
    const allEvents: AuthEvent[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const queryString = constructQueryString(
            { ...queryParams, limit: LIMIT, offset },
            getUserAuthEventsQueryParamsSchema,
        );

        const result = await safeApiCall<GetUserAuthEventsResponseBody>(
            `/users/auth-events${queryString}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            getUserAuthEventsResponseSchema,
        );

        if (!result.ok) return result;

        allEvents.push(...result.data.events);
        hasMore = result.data.hasMore;
        offset += LIMIT;
    }

    return ok({
        message: `Retrieved ${allEvents.length} auth events successfully`,
        events: allEvents,
    });
}
