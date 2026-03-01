import { userKeys } from '@/api/user/user-keys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { GetUserPermissionsSuccessPayload } from '@/api/user/validation/get-user-permissions-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type UserPermissionsQueryResult = Result<
    GetUserPermissionsSuccessPayload,
    NetworkError
>;

type UserPermissionsQueryOptions = Omit<
    UseQueryOptions<UserPermissionsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUserPermissions(): Promise<UserPermissionsQueryResult> {
    const response = await fetch('/api/users/permissions', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const userPermissionsResult: UserPermissionsQueryResult =
        await response.json();
    return userPermissionsResult;
}

export function useUserPermissions(options?: UserPermissionsQueryOptions) {
    return useQuery({
        queryKey: userKeys.permissions(),
        queryFn: fetchUserPermissions,
        ...options,
    });
}
