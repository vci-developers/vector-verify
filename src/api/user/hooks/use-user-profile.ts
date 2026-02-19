import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import type { Result } from '@/lib/result/result';
import type { GetUserProfileSuccessPayload } from '../validation/get-user-profile-schema';
import type { NetworkError } from '@/lib/network/network-error';

async function fetchUserProfile() {
    const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const userProfileResult: Result<
        GetUserProfileSuccessPayload,
        NetworkError
    > = await response.json();
    return userProfileResult;
}

export function useUserProfile() {
    return useQuery({
        queryKey: userKeys.profile(),
        queryFn: fetchUserProfile,
    });
}
