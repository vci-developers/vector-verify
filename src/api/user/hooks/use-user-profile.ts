import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import type { Result } from '@/lib/result/result';
import type { GetUserProfileSuccessPayload } from '../validation/get-user-profile-schema';
import type { NetworkError } from '@/lib/network/network-error';

type UserProfileQueryResult = Result<
    GetUserProfileSuccessPayload,
    NetworkError
>;

type UserProfileQueryOptions = Omit<
    UseQueryOptions<UserProfileQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUserProfile(): Promise<UserProfileQueryResult> {
    const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const userProfileResult: UserProfileQueryResult = await response.json();
    return userProfileResult;
}

export function useUserProfile(options?: UserProfileQueryOptions) {
    return useQuery({
        queryKey: userKeys.profile(),
        queryFn: fetchUserProfile,
        ...options,
    });
}
