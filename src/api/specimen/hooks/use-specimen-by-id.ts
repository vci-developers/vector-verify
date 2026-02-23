import { useQuery } from '@tanstack/react-query';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import type { Result } from '@/lib/result/result';
import type { GetSpecimenByIdSuccessPayload } from '../validation/get-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';

async function fetchSpecimenById(
    specimenId: number,
): Promise<Result<GetSpecimenByIdSuccessPayload, NetworkError>> {
    const response = await fetch(`/api/specimens/${specimenId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const specimenByIdResult: Result<
        GetSpecimenByIdSuccessPayload,
        NetworkError
    > = await response.json();
    return specimenByIdResult;
}

export function useSpecimenById(specimenId: number) {
    return useQuery({
        queryKey: specimenKeys.specimenById(specimenId),
        queryFn: () => fetchSpecimenById(specimenId),
    });
}
