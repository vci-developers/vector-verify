import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import type { Result } from '@/lib/result/result';
import type { GetUserProfileSuccessPayload } from '../validation/get-user-profile-schema';
import type { NetworkError } from '@/lib/network/network-error';

type GetUserProfileQueryResult = Result<
    GetUserProfileSuccessPayload,
    NetworkError
>;

type GetUserProfileQueryOptions = Omit<
    UseQueryOptions<GetUserProfileQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUserProfile(): Promise<GetUserProfileQueryResult> {
    const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getUserProfileResult: GetUserProfileQueryResult =
        await response.json();
    return getUserProfileResult;
}

export function useGetUserProfile(options?: GetUserProfileQueryOptions) {
    return useQuery({
        queryKey: userKeys.profile(),
        queryFn: fetchUserProfile,
        ...options,
    });
}
