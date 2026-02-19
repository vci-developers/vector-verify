import type { Result } from '@/lib/result/result';
import {
    getUserProfileSchema,
    type GetUserProfileResponseBody,
} from '@/api/user/validation/get-user-profile-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getUserProfile(
    accessToken: string,
): Promise<Result<GetUserProfileResponseBody, NetworkError>> {
    return safeApiCall<GetUserProfileResponseBody>(
        '/users/profile',
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getUserProfileSchema,
    );
}
