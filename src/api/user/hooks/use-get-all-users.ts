import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import type { GetAllUsersSuccessPayload } from '@/api/user/validation/get-all-users-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type GetAllUsersQueryResult = Result<GetAllUsersSuccessPayload, NetworkError>;

type GetAllUsersQueryOptions = Omit<
    UseQueryOptions<GetAllUsersQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllUsers(): Promise<GetAllUsersQueryResult> {
    const response = await fetch('/api/users/all', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getAllUsersResult: GetAllUsersQueryResult = await response.json();
    return getAllUsersResult;
}

export function useGetAllUsers(options?: GetAllUsersQueryOptions) {
    return useQuery({
        queryKey: userKeys.all(),
        queryFn: () => fetchAllUsers(),
        ...options,
    });
}
