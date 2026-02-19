import { userKeys } from '@/api/user/user-keys';
import { useQuery } from '@tanstack/react-query';
import type { GetUserPermissionsSuccessPayload } from '@/api/user/validation/get-user-permissions-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

async function fetchUserPermissions(): Promise<
    Result<GetUserPermissionsSuccessPayload, NetworkError>
> {
    const response = await fetch('/api/users/permissions', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const userPermissionsResult: Result<
        GetUserPermissionsSuccessPayload,
        NetworkError
    > = await response.json();
    return userPermissionsResult;
}

export function useUserPermissions() {
    return useQuery({
        queryKey: userKeys.permissions(),
        queryFn: fetchUserPermissions,
    });
}
