import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import type { GetUsersSuccessPayload } from '@/api/user/validation/get-users-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type GetUsersQueryResult = Result<GetUsersSuccessPayload, NetworkError>;

type GetUsersQueryOptions = Omit<
    UseQueryOptions<GetUsersQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUsers(): Promise<GetUsersQueryResult> {
    const response = await fetch('/api/users', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getUsersResult: GetUsersQueryResult = await response.json();
    return getUsersResult;
}

export function useGetUsers(options?: GetUsersQueryOptions) {
    return useQuery({
        queryKey: userKeys.users(),
        queryFn: () => fetchUsers(),
        ...options,
    });
}
