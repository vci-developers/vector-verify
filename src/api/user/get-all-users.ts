import {
    getAllUsersResponseSchema,
    type GetAllUsersResponseBody,
} from '@/api/user/validation/get-all-users-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getAllUsers(
    accessToken: string,
): Promise<Result<GetAllUsersResponseBody, NetworkError>> {
    return safeApiCall<GetAllUsersResponseBody>(
        '/users/',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getAllUsersResponseSchema,
    );
}
