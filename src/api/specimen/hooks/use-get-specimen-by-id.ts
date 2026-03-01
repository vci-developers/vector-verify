import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import type { Result } from '@/lib/result/result';
import type { GetSpecimenByIdSuccessPayload } from '@/api/specimen/validation/get-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';

type GetSpecimenByIdQueryResult = Result<
    GetSpecimenByIdSuccessPayload,
    NetworkError
>;

type GetSpecimenByIdQueryOptions = Omit<
    UseQueryOptions<GetSpecimenByIdQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSpecimenById(
    specimenId: number,
): Promise<GetSpecimenByIdQueryResult> {
    const response = await fetch(`/api/specimens/${specimenId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getSpecimenByIdResult: GetSpecimenByIdQueryResult =
        await response.json();
    return getSpecimenByIdResult;
}

export function useGetSpecimenById(
    specimenId: number,
    options?: GetSpecimenByIdQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.specimenById(specimenId),
        queryFn: () => fetchSpecimenById(specimenId),
        ...options,
    });
}
