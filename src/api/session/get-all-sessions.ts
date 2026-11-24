import {
    type GetAllSessionsQueryParams,
    type GetAllSessionsResponseBody,
} from '@/api/session/validation/get-all-sessions-schema';
import {
    getSessionsQueryParamsSchema,
    getSessionsResponseSchema,
    type GetSessionsResponseBody,
} from '@/api/session/validation/get-sessions-schema';
import type { Session } from '@/api/session/validation/session-schema';
import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

const LIMIT = 100;

export async function getAllSessions(
    accessToken: string,
    queryParams: GetAllSessionsQueryParams,
): Promise<Result<GetAllSessionsResponseBody, NetworkError>> {
    const { collectionCycleIds, ...sessionsQueryParams } = queryParams;
    const cycleQueryParamsList = collectionCycleIds
        ? collectionCycleIds.map(collectionCycleId => ({
              ...sessionsQueryParams,
              collectionCycleId: Number(collectionCycleId),
          }))
        : [sessionsQueryParams];
    const allSessions: Session[] = [];

    for (const cycleQueryParams of cycleQueryParamsList) {
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const queryString = constructQueryString(
                { ...cycleQueryParams, limit: LIMIT, offset },
                getSessionsQueryParamsSchema,
            );

            const result = await safeApiCall<GetSessionsResponseBody>(
                `/sessions${queryString}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
                getSessionsResponseSchema,
            );

            if (!result.ok) return result;

            allSessions.push(...result.data.sessions);
            hasMore = result.data.hasMore;
            offset += LIMIT;
        }
    }

    return ok({
        message: `Retrieved ${allSessions.length} sessions successfully`,
        sessions: allSessions,
    });
}
