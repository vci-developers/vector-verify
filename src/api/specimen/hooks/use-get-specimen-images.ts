import { specimenKeys } from '../specimen-keys';
import { useQuery } from '@tanstack/react-query';
import {
    getSpecimenImagesResponseSchema,
    type GetSpecimenImagesResponse,
} from '@/api/specimen/validation/get-specimen-images-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

export function useGetSpecimenImages(specimenId: number, enabled = true) {
    return useQuery({
        queryKey: specimenKeys.images(specimenId),
        enabled,
        queryFn: async (): Promise<
            Result<GetSpecimenImagesResponse, NetworkError>
        > => {
            const response = await fetch(`/api/specimens/${specimenId}/images`);
            const result: Result<unknown, NetworkError> = await response.json();
            if (!result.ok) return result;
            const parsed = getSpecimenImagesResponseSchema.safeParse(
                result.data,
            );
            return parsed.success
                ? { ok: true, data: parsed.data }
                : {
                      ok: false,
                      error: { kind: 'client', message: 'Invalid response' },
                  };
        },
    });
}
