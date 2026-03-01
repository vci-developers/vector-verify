import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import type { Result } from '@/lib/result/result';
import type { GetSpecimenByIdSuccessPayload } from '@/api/specimen/validation/get-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';

type SpecimenByIdQueryResult = Result<
    GetSpecimenByIdSuccessPayload,
    NetworkError
>;

type SpecimenByIdQueryOptions = Omit<
    UseQueryOptions<SpecimenByIdQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSpecimenById(
    specimenId: number,
): Promise<SpecimenByIdQueryResult> {
    const response = await fetch(`/api/specimens/${specimenId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const specimenByIdResult: SpecimenByIdQueryResult = await response.json();
    return specimenByIdResult;
}

export function useSpecimenById(
    specimenId: number,
    options?: SpecimenByIdQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.specimenById(specimenId),
        queryFn: () => fetchSpecimenById(specimenId),
        ...options,
    });
}
