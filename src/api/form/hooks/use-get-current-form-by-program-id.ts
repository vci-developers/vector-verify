import type { Result } from '@/lib/result/result';
import type { GetCurrentFormByProgramIdSuccessPayload } from '../validation/get-current-form-by-program-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { formKeys } from '../form-keys';

type GetCurrentFormByProgramIdQueryResult = Result<
    GetCurrentFormByProgramIdSuccessPayload,
    NetworkError
>;

type GetCurrentFormByProgramIdQueryOptions = Omit<
    UseQueryOptions<GetCurrentFormByProgramIdQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchCurrentFormByProgramId(
    programId: number,
): Promise<GetCurrentFormByProgramIdQueryResult> {
    const response = await fetch(`/api/programs/${programId}/forms/current`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    const getCurrentFormByProgramIdResult: GetCurrentFormByProgramIdQueryResult =
        await response.json();
    return getCurrentFormByProgramIdResult;
}

export function useGetCurrentFormByProgramId(
    programId: number,
    options?: GetCurrentFormByProgramIdQueryOptions,
) {
    return useQuery({
        queryKey: formKeys.currentFormByProgramId(programId),
        queryFn: () => fetchCurrentFormByProgramId(programId),
        ...options,
    });
}
