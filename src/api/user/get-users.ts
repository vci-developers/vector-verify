import {
    getUsersResponseSchema,
    type GetUsersResponseBody,
} from '@/api/user/validation/get-users-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getUsers(
    accessToken: string,
): Promise<Result<GetUsersResponseBody, NetworkError>> {
    return safeApiCall<GetUsersResponseBody>(
        '/users/',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getUsersResponseSchema,
    );
}
