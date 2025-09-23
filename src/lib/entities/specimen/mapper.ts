import type {
  SpecimenDto,
  SpecimenWithImagesDto,
  SpecimenWithSessionDto,
  SpecimenExpandedDto,
} from '@/lib/entities/specimen/dto';
import type { Specimen } from '@/lib/entities/specimen/model';
import { mapSpecimenImageDtoToModel } from '@/lib/entities/specimen-image/mapper';
import { mapSessionDtoToModel } from '@/lib/entities/session/mapper';

export function mapSpecimenDtoToModel(dto: SpecimenDto): Specimen {
  return { ...dto };
}

export function mapSpecimenWithImagesDtoToModel(
  dto: SpecimenWithImagesDto,
): Specimen {
  const base = mapSpecimenDtoToModel(dto);
  return {
    ...base,
    images: dto.images ? dto.images.map(mapSpecimenImageDtoToModel) : undefined,
    thumbnailImage: dto.thumbnailImage
      ? mapSpecimenImageDtoToModel(dto.thumbnailImage)
      : undefined,
  };
}

export function mapSpecimenWithSessionDtoToModel(
  dto: SpecimenWithSessionDto,
): Specimen {
  const base = mapSpecimenDtoToModel(dto);
  return {
    ...base,
    session: dto.session ? mapSessionDtoToModel(dto.session) : undefined,
  };
}

export function mapSpecimenExpandedDtoToModel(
  dto: SpecimenExpandedDto,
): Specimen {
  const base = mapSpecimenDtoToModel(dto);
  return {
    ...base,
    images: dto.images ? dto.images.map(mapSpecimenImageDtoToModel) : undefined,
    thumbnailImage: dto.thumbnailImage
      ? mapSpecimenImageDtoToModel(dto.thumbnailImage)
      : undefined,
    session: dto.session ? mapSessionDtoToModel(dto.session) : undefined,
  };
}
