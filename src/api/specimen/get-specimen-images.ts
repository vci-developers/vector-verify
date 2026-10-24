import 'server-only';
import { safeApiCall } from '@/lib/network/safe-api-call';
import { getSpecimenImagesResponseSchema } from './validation/get-specimen-images-schema';
export async function getSpecimenImages(
    accessToken: string,
    specimenId: number,
) {
    return safeApiCall(
        `/specimens/${specimenId}/images`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        getSpecimenImagesResponseSchema,
    );
}
