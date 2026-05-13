import { userKeys } from '@/api/user/user-keys';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { GetUserPermissionsSuccessPayload } from '@/api/user/validation/get-user-permissions-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type GetUserPermissionsQueryResult = Result<
    GetUserPermissionsSuccessPayload,
    NetworkError
>;

type GetUserPermissionsQueryOptions = Omit<
    UseQueryOptions<GetUserPermissionsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUserPermissions(): Promise<GetUserPermissionsQueryResult> {
    const response = await fetch('/api/users/permissions', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getUserPermissionsResult: GetUserPermissionsQueryResult =
        await response.json();
    return getUserPermissionsResult;
}

export function useGetUserPermissions(
    options?: GetUserPermissionsQueryOptions,
) {
    return useQuery({
        queryKey: userKeys.permissions(),
        queryFn: fetchUserPermissions,
        ...options,
    });
}
