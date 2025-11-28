import bff from '@/shared/infra/api/bff-client';
import type { SpecimenImagesResponseDto } from '@/shared/entities/specimen-image/dto';
import { mapSpecimenImageDtoToModel } from '@/shared/entities/specimen-image/mapper';
import type { SpecimenImage } from '@/shared/entities/specimen-image/model';

export interface SpecimenImagesResponse {
  images: SpecimenImage[];
  thumbnailUrl: string | null;
  thumbnailImageId: number | null;
}

export async function getSpecimenImages(
  specimenId: number,
): Promise<SpecimenImagesResponse> {
  const response = await bff<SpecimenImagesResponseDto>(
    `/specimens/${specimenId}/images/data`,
    {
      method: 'GET',
    },
  );

  return {
    images: response.images.map(mapSpecimenImageDtoToModel),
    thumbnailUrl: response.thumbnailUrl,
    thumbnailImageId: response.thumbnailImageId,
  };
}
